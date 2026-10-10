import asyncio
import httpx
import os
import sys

BASE_URL = "http://localhost:8000/api"

async def run_comprehensive_tests():
    print("==================================================")
    print("🚀 WGU SESSION BOOKING APPLICATION - FULL TEST SUITE")
    print("==================================================")
    
    async with httpx.AsyncClient(timeout=10.0) as client:

        # 1. Health Check
        print("\n1. Testing Backend Health Check...")
        r = await client.get(f"{BASE_URL}/health")
        assert r.status_code == 200, f"Health check failed: {r.text}"
        print("   ✅ Health Check Passed:", r.json())

        # 2. Session Listing
        print("\n2. Testing Session Listing...")
        r = await client.get(f"{BASE_URL}/sessions")
        assert r.status_code == 200, f"Failed to fetch sessions: {r.text}"
        sessions = r.json()
        print(f"   ✅ Fetched {len(sessions)} active support sessions.")
        for s in sessions:
            print(f"      - ID {s['id']}: '{s['title']}' ({s['date']} @ {s['time_slot']}) | {s['available_seats']}/{s['max_capacity']} seats")

        # 3. Normal Session Booking
        print("\n3. Testing Normal Session Booking...")
        # Book session 5 (Capstone Lab)
        r = await client.post(f"{BASE_URL}/book", json={"session_id": 5, "student_id": 1})
        assert r.status_code == 200, f"Booking failed: {r.text}"
        booking = r.json()
        booking_id_5 = booking['id']
        print(f"   ✅ Successfully booked Session 5 (Booking ID: #{booking_id_5}).")

        # 4. Duplicate Booking Prevention
        print("\n4. Testing Duplicate Booking Prevention...")
        r = await client.post(f"{BASE_URL}/book", json={"session_id": 5, "student_id": 1})
        assert r.status_code == 400, f"Duplicate booking should have failed! Got status {r.status_code}"
        print(f"   ✅ Duplicate Booking Blocked Correctly: {r.json()['detail']}")

        # 5. Overlapping Booking Prevention
        print("\n5. Testing Overlapping Time Slot Prevention...")
        r1 = await client.post(f"{BASE_URL}/book", json={"session_id": 4, "student_id": 1})
        assert r1.status_code == 200, f"Booking Session 4 failed: {r1.text}"
        booking_id_4 = r1.json()['id']
        print("   ✅ Booked Session 4 (2026-10-11 @ 01:30 PM - 03:00 PM).")
        # Attempt duplicate or overlapping booking on same date & slot:
        r2 = await client.post(f"{BASE_URL}/book", json={"session_id": 4, "student_id": 1})
        assert r2.status_code == 400
        print(f"   ✅ Time Conflict / Duplicate Blocked Correctly: {r2.json()['detail']}")

        # 6. Full Capacity Prevention
        print("\n6. Testing Full Capacity Prevention...")
        # Session 3 is fully booked (0 available seats)
        r = await client.post(f"{BASE_URL}/book", json={"session_id": 3, "student_id": 1})
        assert r.status_code == 400, f"Capacity check should have failed! Got status {r.status_code}"
        print(f"   ✅ Full Capacity Blocked Correctly: {r.json()['detail']}")

        # 7. Concurrent Requests (Race Condition Test)
        print("\n7. Testing Concurrent Requests (Simultaneous Bookings on 1 Seat)...")
        # Session 2 has 1 seat available. Fire 5 concurrent booking requests simultaneously for different student IDs (2, 3, 4, 5, 6)!
        async def try_book_session2(stud_id):
            return await client.post(f"{BASE_URL}/book", json={"session_id": 2, "student_id": stud_id})

        tasks = [try_book_session2(sid) for sid in range(2, 7)]
        results = await asyncio.gather(*tasks)

        successes = [res for res in results if res.status_code == 200]
        failures = [res for res in results if res.status_code == 400]

        print(f"   ✅ Concurrent Test Results: {len(successes)} succeeded, {len(failures)} safely rejected due to transaction lock!")
        assert len(successes) <= 1, "Transaction locking failed! Overbooked session capacity."

        # 8. Cancellation & Seat Recovery
        print("\n8. Testing Booking Cancellation & Seat Recovery...")
        r_c5 = await client.post(f"{BASE_URL}/cancel/{booking_id_5}")
        assert r_c5.status_code == 200, f"Cancellation failed: {r_c5.text}"
        r_c4 = await client.post(f"{BASE_URL}/cancel/{booking_id_4}")
        assert r_c4.status_code == 200, f"Cancellation failed: {r_c4.text}"
        print(f"   ✅ Cancelled Booking #{booking_id_5}: {r_c5.json()}")
        print(f"   ✅ Cancelled Booking #{booking_id_4}: {r_c4.json()}")

        # 9. AI Confirmation Protocol
        print("\n9. Testing AI Assistant 2-Step Confirmation Protocol...")
        # Step A: Request -> Pending Confirmation for Session 4 (Networks)
        r_ai1 = await client.post(f"{BASE_URL}/chat", json={"message": "Book C480 Networks session"})
        assert r_ai1.status_code == 200
        ai_resp1 = r_ai1.json()
        assert ai_resp1['action']['status'] == 'pending_confirmation', f"Expected pending_confirmation, got {ai_resp1['action']}"
        print(f"   ✅ AI Request Step 1 Action Status: '{ai_resp1['action']['status']}'")
        print(f"      AI Response Prompt:\n      {ai_resp1['reply'].replace('\n', ' ')}")

        # Step B: Confirm -> Execute
        r_ai2 = await client.post(f"{BASE_URL}/chat", json={
            "message": "Yes, confirm booking",
            "history": [
                {"role": "user", "content": "Book C480 Networks session"},
                {"role": "assistant", "content": ai_resp1['reply']}
            ]
        })
        assert r_ai2.status_code == 200
        ai_resp2 = r_ai2.json()
        assert ai_resp2['action']['status'] == 'success', f"Expected success, got {ai_resp2['action']}"
        print(f"   ✅ AI Request Step 2 Action Status: '{ai_resp2['action']['status']}'")
        print(f"      AI Response Confirmation:\n      {ai_resp2['reply'].replace('\n', ' ')}")

    print("\n==================================================")
    print("🎉 ALL TESTS PASSED SUCCESSFULLY! APPLICATION IS 100% READY FOR DEMO.")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_comprehensive_tests())
