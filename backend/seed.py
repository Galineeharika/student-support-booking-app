from sqlalchemy.orm import Session as DBSession
from backend.models import Student, Session, Booking
from datetime import datetime, timedelta

def seed_database(db: DBSession):
    if db.query(Student).first() is not None:
        return

    print("Seeding WGU Support Sessions & Student...")

    # Sample Student
    student = Student(
        name="Alex Morgan",
        email="amorgan@wgu.edu",
        wgu_id="001948271"
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    # Dates
    today_str = datetime.now().strftime("%Y-%m-%d")
    tomorrow_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    day_after_str = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")

    # Sample Sessions with Capacities
    sessions = [
        Session(
            title="C950 Data Structures: Hash Table Implementation Lab",
            instructor_name="Prof. Sarah Jenkins",
            category="Course Instructor",
            date=tomorrow_str,
            time_slot="10:00 AM - 11:30 AM",
            max_capacity=4,
            booked_count=1
        ),
        Session(
            title="C175 Database Applications: 3NF Normalization Workshop",
            instructor_name="Prof. Sarah Jenkins",
            category="Course Instructor",
            date=tomorrow_str,
            time_slot="02:00 PM - 03:30 PM",
            max_capacity=3,
            booked_count=2
        ),
        Session(
            title="C959 Discrete Mathematics: Truth Tables & Logic Proofs",
            instructor_name="Dr. Elena Rostova",
            category="Math Center",
            date=day_after_str,
            time_slot="11:00 AM - 12:30 PM",
            max_capacity=2,
            booked_count=2  # FULLY BOOKED DEMO!
        ),
        Session(
            title="C480 Networks: CompTIA Subnetting Masterclass",
            instructor_name="Prof. David Thorne",
            category="Course Instructor",
            date=day_after_str,
            time_slot="01:30 PM - 03:00 PM",
            max_capacity=6,
            booked_count=3
        ),
        Session(
            title="WGU Capstone Proposal & APA Formatting Lab",
            instructor_name="Michael Chang",
            category="Writing Center",
            date=today_str,
            time_slot="04:00 PM - 05:00 PM",
            max_capacity=5,
            booked_count=0
        )
    ]
    db.add_all(sessions)
    db.commit()

    # Pre-book 1 session for Alex
    first_session = sessions[0]
    initial_booking = Booking(
        student_id=student.id,
        session_id=first_session.id,
        status="confirmed"
    )
    db.add(initial_booking)
    db.commit()

    print("Seed complete!")
