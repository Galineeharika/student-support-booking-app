import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DBSession, joinedload
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

# Load environment variables from .env
load_dotenv()

from backend.database import engine, Base, get_db
from backend.models import Student, Session, Booking
from backend.schemas import (
    StudentResponse,
    SessionResponse,
    BookingCreate,
    BookingResponse
)
from backend.seed import seed_database
from backend.ai_assistant import process_ai_chat

# Pydantic Chat Schema
class ChatPayload(BaseModel):
    message: str
    history: Optional[List[dict]] = []
    student_id: Optional[int] = 1

# Create SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WGU Student Support Session Booking API",
    description="FastAPI Backend with Transactional Booking, Overlap & Duplicate Prevention",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_seed():
    db = next(get_db())
    seed_database(db)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "WGU Session Booking API",
        "openrouter_key_set": bool(os.getenv("OPENROUTER_API_KEY") and os.getenv("OPENROUTER_API_KEY") != "your_openrouter_api_key_here")
    }

@app.get("/api/student", response_model=StudentResponse)
def get_student(db: DBSession = Depends(get_db)):
    student = db.query(Student).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.get("/api/sessions", response_model=List[SessionResponse])
def get_sessions(db: DBSession = Depends(get_db)):
    sessions = db.query(Session).order_by(Session.date.asc()).all()
    result = []
    for s in sessions:
        res = SessionResponse(
            id=s.id,
            title=s.title,
            instructor_name=s.instructor_name,
            category=s.category,
            date=s.date,
            time_slot=s.time_slot,
            max_capacity=s.max_capacity,
            booked_count=s.booked_count,
            available_seats=max(0, s.max_capacity - s.booked_count)
        )
        result.append(res)
    return result

@app.get("/api/bookings", response_model=List[BookingResponse])
def get_student_bookings(student_id: int = 1, db: DBSession = Depends(get_db)):
    bookings = db.query(Booking).options(joinedload(Booking.session)).filter(
        Booking.student_id == student_id,
        Booking.status == "confirmed"
    ).order_by(Booking.booked_at.desc()).all()

    result = []
    for b in bookings:
        s = b.session
        sess_resp = SessionResponse(
            id=s.id,
            title=s.title,
            instructor_name=s.instructor_name,
            category=s.category,
            date=s.date,
            time_slot=s.time_slot,
            max_capacity=s.max_capacity,
            booked_count=s.booked_count,
            available_seats=max(0, s.max_capacity - s.booked_count)
        )
        result.append(BookingResponse(
            id=b.id,
            student_id=b.student_id,
            session_id=b.session_id,
            status=b.status,
            booked_at=b.booked_at,
            session=sess_resp
        ))
    return result

# TRANSACTIONAL BOOKING ENDPOINT
@app.post("/api/book", response_model=BookingResponse)
def book_session(payload: BookingCreate, db: DBSession = Depends(get_db)):
    student_id = payload.student_id
    session_id = payload.session_id

    # Begin Database Transaction for Concurrency & Capacity Safety
    try:
        # 1. Check for Existing Booking (Confirmed or Cancelled)
        existing_booking = db.query(Booking).filter(
            Booking.student_id == student_id,
            Booking.session_id == session_id
        ).first()

        if existing_booking and existing_booking.status == "confirmed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Duplicate Booking: You are already registered for this session."
            )

        # 2. Lock & Check Session Capacity
        target_session = db.query(Session).filter(Session.id == session_id).with_for_update().first()
        if not target_session:
            raise HTTPException(status_code=404, detail="Session not found.")

        if target_session.booked_count >= target_session.max_capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Session Full: No available seats left for '{target_session.title}'."
            )

        # 3. Check Overlapping Booking (Same date & time_slot)
        overlapping_booking = db.query(Booking).join(Session).filter(
            Booking.student_id == student_id,
            Booking.status == "confirmed",
            Session.date == target_session.date,
            Session.time_slot == target_session.time_slot
        ).first()

        if overlapping_booking:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Time Conflict: You already have a session booked on {target_session.date} at {target_session.time_slot}."
            )

        # 4. Create or Update Booking & Atomically Increment Booked Count
        if existing_booking and existing_booking.status == "cancelled":
            existing_booking.status = "confirmed"
            existing_booking.booked_at = datetime.utcnow()
            new_booking = existing_booking
        else:
            new_booking = Booking(
                student_id=student_id,
                session_id=session_id,
                status="confirmed",
                booked_at=datetime.utcnow()
            )
            db.add(new_booking)

        target_session.booked_count += 1
        db.commit()
        db.refresh(new_booking)

        # Build response object
        sess_resp = SessionResponse(
            id=target_session.id,
            title=target_session.title,
            instructor_name=target_session.instructor_name,
            category=target_session.category,
            date=target_session.date,
            time_slot=target_session.time_slot,
            max_capacity=target_session.max_capacity,
            booked_count=target_session.booked_count,
            available_seats=max(0, target_session.max_capacity - target_session.booked_count)
        )

        return BookingResponse(
            id=new_booking.id,
            student_id=new_booking.student_id,
            session_id=new_booking.session_id,
            status=new_booking.status,
            booked_at=new_booking.booked_at,
            session=sess_resp
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Booking transaction error: {str(e)}")

# TRANSACTIONAL CANCELLATION ENDPOINT
@app.post("/api/cancel/{booking_id}", response_model=dict)
def cancel_booking(booking_id: int, db: DBSession = Depends(get_db)):
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found.")

        if booking.status == "cancelled":
            return {"message": "Booking is already cancelled."}

        # Update status
        booking.status = "cancelled"

        # Decrement booked count on session
        target_session = db.query(Session).filter(Session.id == booking.session_id).with_for_update().first()
        if target_session:
            target_session.booked_count = max(0, target_session.booked_count - 1)

        db.commit()
        return {
            "message": "Booking successfully cancelled.",
            "booking_id": booking_id,
            "session_id": booking.session_id,
            "available_seats": max(0, target_session.max_capacity - target_session.booked_count) if target_session else 0
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Cancellation transaction error: {str(e)}")

@app.post("/api/chat")
async def chat_with_ai(payload: ChatPayload, db: DBSession = Depends(get_db)):
    result = await process_ai_chat(
        message=payload.message,
        history=payload.history,
        db=db,
        student_id=payload.student_id or 1
    )
    return result
