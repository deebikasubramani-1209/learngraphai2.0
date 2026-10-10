from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.entities import Student
from app.schemas.api_schemas import StudentResponse, StudentCreate

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("", response_model=List[StudentResponse])
def get_all_students(db: Session = Depends(get_db)):
    """Fetch all registered students."""
    students = db.query(Student).all()
    return students

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: str, db: Session = Depends(get_db)):
    """Fetch a student by ID."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.post("", response_model=StudentResponse)
def create_student(payload: StudentCreate, db: Session = Depends(get_db)):
    """Register a new student."""
    existing = db.query(Student).filter(Student.email == payload.email).first()
    if existing:
        return existing
    
    student = Student(
        name=payload.name,
        email=payload.email,
        role=payload.role or "Student"
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student
