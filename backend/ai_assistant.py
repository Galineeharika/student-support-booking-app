import os
import httpx
import json
from sqlalchemy.orm import Session as DBSession
from backend.models import Session, Booking, Student

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_NAME = "meta-llama/llama-3.3-70b-instruct"

CONFIRM_WORDS = ["yes", "confirm", "proceed", "do it", "sure", "yep", "ok", "okay", "correct", "please do"]
DECLINE_WORDS = ["no", "cancel request", "nevermind", "stop", "don't", "dont", "nah"]

async def process_ai_chat(message: str, history: list, db: DBSession, student_id: int = 1):
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()

    # Reset session snapshot and expunge memory cache so all queries fetch fresh committed data from SQLite
    db.rollback()
    db.expunge_all()

    # 1. Fetch current live sessions & active student bookings
    sessions = db.query(Session).order_by(Session.date.asc()).all()
    sessions_context = [
        {
            "id": s.id,
            "title": s.title,
            "instructor": s.instructor_name,
            "category": s.category,
            "date": s.date,
            "time_slot": s.time_slot,
            "available_seats": max(0, s.max_capacity - s.booked_count),
            "max_capacity": s.max_capacity
        }
        for s in sessions
    ]

    active_bookings = db.query(Booking).filter(
        Booking.student_id == student_id,
        Booking.status == "confirmed"
    ).populate_existing().all()

    bookings_context = [
        {
            "booking_id": b.id,
            "session_id": b.session_id,
            "title": b.session.title if b.session else "Session",
            "date": b.session.date if b.session else "",
            "time_slot": b.session.time_slot if b.session else ""
        }
        for b in active_bookings
    ]

    msg_lower = message.lower().strip()
    action_result = None

    # Check last assistant message in conversation history for pending confirmation
    last_assistant_msg = ""
    for h in reversed(history):
        if h.get("role") == "assistant":
            last_assistant_msg = h.get("content", "").lower()
            break

    was_awaiting_confirmation = (
        "confirmation required" in last_assistant_msg or 
        "reply 'yes'" in last_assistant_msg or 
        "reply yes" in last_assistant_msg
    )

    # ----------------------------------------------------
    # SCENARIO A: Student is confirming or declining a pending proposal
    # ----------------------------------------------------
    if was_awaiting_confirmation:
        if any(w in msg_lower for w in DECLINE_WORDS):
            action_result = {
                "type": "decline",
                "status": "cancelled",
                "details": "Booking proposal was declined. No changes were made to your schedule."
            }
        elif any(w in msg_lower for w in CONFIRM_WORDS):
            # Identify which session or booking was proposed in last assistant message
            target_session = None
            target_booking = None

            for s in sessions:
                if s.title.lower() in last_assistant_msg or f"id: {s.id}" in last_assistant_msg or f"session #{s.id}" in last_assistant_msg:
                    target_session = s
                    break

            for b in active_bookings:
                if b.session and b.session.title.lower() in last_assistant_msg:
                    target_booking = b
                    break

            if not target_session and not target_booking:
                # Fallback to session matching last assistant message keywords
                for s in sessions:
                    code = s.title.split()[0].lower()
                    if code in last_assistant_msg:
                        target_session = s
                        break

            # Process Booking Execution if user confirmed
            if target_session:
                # STRICT BACKEND VALIDATION ENFORCEMENT
                existing_record = db.query(Booking).filter(
                    Booking.student_id == student_id,
                    Booking.session_id == target_session.id
                ).populate_existing().first()

                overlap = db.query(Booking).join(Session).filter(
                    Booking.student_id == student_id,
                    Booking.status == "confirmed",
                    Session.date == target_session.date,
                    Session.time_slot == target_session.time_slot
                ).populate_existing().first()

                sess_locked = db.query(Session).filter(Session.id == target_session.id).populate_existing().with_for_update().first()

                if existing_record and existing_record.status == "confirmed":
                    action_result = {
                        "type": "book",
                        "status": "error",
                        "details": f"Backend Validation Rejection: You are already registered for '{target_session.title}'."
                    }
                elif overlap:
                    action_result = {
                        "type": "book",
                        "status": "error",
                        "details": f"Backend Rejection: You have a time conflict on {target_session.date} @ {target_session.time_slot}."
                    }
                elif not sess_locked or sess_locked.booked_count >= sess_locked.max_capacity:
                    action_result = {
                        "type": "book",
                        "status": "error",
                        "details": f"Backend Rejection: '{target_session.title}' is fully booked (0 available seats)."
                    }
                else:
                    # VALIDATION PASSED -> EXECUTE TRANSACTION
                    try:
                        if existing_record and existing_record.status == "cancelled":
                            existing_record.status = "confirmed"
                            existing_record.booked_at = datetime.utcnow()
                        else:
                            new_booking = Booking(student_id=student_id, session_id=target_session.id, status="confirmed")
                            db.add(new_booking)

                        sess_locked.booked_count += 1
                        db.commit()
                        action_result = {
                            "type": "book",
                            "status": "success",
                            "details": f"✅ Confirmed & Registered: Booked '{target_session.title}' for {target_session.date} @ {target_session.time_slot}!"
                        }
                    except Exception as e:
                        db.rollback()
                        action_result = {
                            "type": "book",
                            "status": "error",
                            "details": f"Backend Validation Rejection: Could not complete booking ({str(e)})."
                        }

            # Process Cancellation Execution if user confirmed
            elif target_booking:
                target_booking.status = "cancelled"
                if target_booking.session:
                    target_booking.session.booked_count = max(0, target_booking.session.booked_count - 1)
                db.commit()
                action_result = {
                    "type": "cancel",
                    "status": "success",
                    "details": f"✅ Confirmed & Cancelled: Booking for '{target_booking.session.title if target_booking.session else 'Session'}' has been cancelled."
                }

    # ----------------------------------------------------
    # SCENARIO B: New Request to Book or Cancel -> PROPOSE & ASK FOR CONFIRMATION
    # ----------------------------------------------------
    if not action_result:
        # Check Cancellation request
        if "cancel" in msg_lower:
            for b in active_bookings:
                st_title = b.session.title.lower() if b.session else ""
                code = st_title.split()[0] if st_title else ""
                if (code and code in msg_lower) or str(b.id) in msg_lower or (b.session and any(w in msg_lower for w in st_title.split() if len(w) > 4)):
                    action_result = {
                        "type": "propose_cancel",
                        "status": "pending_confirmation",
                        "booking_id": b.id,
                        "session_title": b.session.title if b.session else "Session",
                        "details": f"⚠️ **Confirmation Required**: Would you like me to cancel your booking for **'{b.session.title if b.session else 'Session'}'**? Please reply **'Yes'** or **'Confirm'** to proceed."
                    }
                    break

        # Check Booking request
        if not action_result and ("book" in msg_lower or "register" in msg_lower or "reserve" in msg_lower or "schedule" in msg_lower):
            matched_session = None

            for s in sessions:
                code = s.title.split()[0].lower() # e.g. "c950", "c175", "c959", "c480", "wgu"
                if code in msg_lower:
                    matched_session = s
                    break

            if not matched_session:
                for s in sessions:
                    title_words = [w.strip(":,") for w in s.title.lower().split() if len(w) > 4]
                    if any(w in msg_lower for w in title_words) or str(s.id) in msg_lower:
                        matched_session = s
                        break

            if matched_session:
                # RUN BACKEND VALIDATION CHECKS BEFORE PROPOSING
                existing = db.query(Booking).filter(
                    Booking.student_id == student_id,
                    Booking.session_id == matched_session.id,
                    Booking.status == "confirmed"
                ).first()

                overlap = db.query(Booking).join(Session).filter(
                    Booking.student_id == student_id,
                    Booking.status == "confirmed",
                    Session.date == matched_session.date,
                    Session.time_slot == matched_session.time_slot
                ).first()

                avail_seats = max(0, matched_session.max_capacity - matched_session.booked_count)

                if existing:
                    action_result = {
                        "type": "book_validation_error",
                        "status": "error",
                        "details": f"Backend Validation Rejection: You are already registered for '{matched_session.title}'."
                    }
                elif overlap:
                    action_result = {
                        "type": "book_validation_error",
                        "status": "error",
                        "details": f"Backend Validation Rejection: You have a time conflict on {matched_session.date} @ {matched_session.time_slot}."
                    }
                elif avail_seats <= 0:
                    action_result = {
                        "type": "book_validation_error",
                        "status": "error",
                        "details": f"Backend Validation Rejection: '{matched_session.title}' is fully booked (0 available seats)."
                    }
                else:
                    action_result = {
                        "type": "propose_book",
                        "status": "pending_confirmation",
                        "session_id": matched_session.id,
                        "session_title": matched_session.title,
                        "details": f"I found an available slot for **'{matched_session.title}'** on **{matched_session.date} @ {matched_session.time_slot}** ({avail_seats} seats left).\n\n⚠️ **Confirmation Required**: Would you like me to complete this booking for you? Please reply **'Yes'** or **'Confirm'** to proceed."
                    }

    # 3. Formulate System Prompt with Strict Safety Protocols
    system_prompt = f"""You are the WGU Night Owl AI Support Assistant.
Current Student: Alex Morgan (WGU ID: #001948271)

LIVE AVAILABLE SESSIONS:
{json.dumps(sessions_context, indent=2)}

ACTIVE STUDENT BOOKINGS:
{json.dumps(bookings_context, indent=2)}

SYSTEM EVALUATION RESULT:
{json.dumps(action_result) if action_result else "No action triggered."}

CRITICAL MANDATORY RULES:
1. ALWAYS ask for explicit student confirmation ('Yes' or 'Confirm') before booking or cancelling any session.
2. If system result is 'pending_confirmation', ask: "Would you like me to complete this? Please reply 'Yes' or 'Confirm' to proceed."
3. If backend validation failed (duplicate, 0 seats, or time conflict), state the backend error message clearly and NEVER attempt to bypass validation checks.
"""

    if api_key and api_key != "your_openrouter_api_key_here":
        try:
            messages = [{"role": "system", "content": system_prompt}]
            for h in history[-6:]:
                messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
            messages.append({"role": "user", "content": message})

            headers = {
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "WGU Student Support Booking App",
                "Content-Type": "application/json"
            }

            payload = {
                "model": MODEL_NAME,
                "messages": messages,
                "max_tokens": 400,
                "temperature": 0.7
            }

            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(OPENROUTER_URL, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    ai_reply = data['choices'][0]['message']['content']
                    return {
                        "reply": ai_reply,
                        "action": action_result,
                        "openrouter_used": True
                    }
        except Exception as e:
            print("Error calling OpenRouter API:", str(e))

    # Fallback Response
    if action_result:
        fallback_reply = action_result['details']
    else:
        fallback_reply = generate_fallback_ai_reply(message, sessions_context, bookings_context)

    return {
        "reply": fallback_reply,
        "action": action_result,
        "openrouter_used": False
    }

def generate_fallback_ai_reply(msg, sessions, bookings):
    msg_lower = msg.lower()
    if "session" in msg_lower or "available" in msg_lower or "list" in msg_lower:
        avail_list = [f"• **{s['title']}** ({s['date']} @ {s['time_slot']}) — {s['available_seats']} seats left" for s in sessions if s['available_seats'] > 0]
        return "🦉 Here are currently available support sessions:\n\n" + "\n".join(avail_list) + "\n\nTell me which session you'd like to book, and I will ask for your confirmation before reserving your seat!"

    if "booking" in msg_lower or "my session" in msg_lower:
        if bookings:
            b_list = [f"• **{b['title']}** ({b['date']} @ {b['time_slot']})" for b in bookings]
            return "🦉 Your active bookings:\n\n" + "\n".join(b_list)
        return "🦉 You currently have no active bookings."

    return "🦉 Hello Alex! I am your WGU Support AI Assistant. Ask me to book or cancel any session, and I will always confirm with you first!"
