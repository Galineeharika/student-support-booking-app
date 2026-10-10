from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    wgu_id = Column(String, unique=True, index=True)

    bookings = relationship("Booking", back_populates="student")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    instructor_name = Column(String, nullable=False)
    category = Column(String, default="General Support")
    date = Column(String, nullable=False) # YYYY-MM-DD
    time_slot = Column(String, nullable=False) # 10:00 AM - 11:30 AM
    max_capacity = Column(Integer, default=5)
    booked_count = Column(Integer, default=0)

    bookings = relationship("Booking", back_populates="session")

class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        UniqueConstraint('student_id', 'session_id', name='_student_session_uc'),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    booked_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="confirmed") # confirmed, cancelled

    student = relationship("Student", back_populates="bookings")
    session = relationship("Session", back_populates="bookings")
