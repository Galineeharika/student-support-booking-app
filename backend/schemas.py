from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class StudentResponse(BaseModel):
    id: int
    name: str
    email: str
    wgu_id: str

    class Config:
        from_attributes = True

class SessionResponse(BaseModel):
    id: int
    title: str
    instructor_name: str
    category: str
    date: str
    time_slot: str
    max_capacity: int
    booked_count: int
    available_seats: int

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    session_id: int
    student_id: int = 1

class BookingResponse(BaseModel):
    id: int
    student_id: int
    session_id: int
    status: str
    booked_at: datetime
    session: SessionResponse

    class Config:
        from_attributes = True
