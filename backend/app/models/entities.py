import datetime
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Student(Base):
    __tablename__ = "students"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(String(100), default="Student")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    mastery_records = relationship("Mastery", back_populates="student", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="student", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="student", cascade="all, delete-orphan")
    history_records = relationship("MasteryHistory", back_populates="student", cascade="all, delete-orphan")


class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    
    concepts = relationship("Concept", back_populates="subject", cascade="all, delete-orphan")


class Concept(Base):
    __tablename__ = "concepts"
    
    id = Column(String(64), primary_key=True)
    subject_id = Column(String(64), ForeignKey("subjects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    
    subject = relationship("Subject", back_populates="concepts")
    questions = relationship("Question", back_populates="concept", cascade="all, delete-orphan")
    mastery_records = relationship("Mastery", back_populates="concept", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    concept_id = Column(String(64), ForeignKey("concepts.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_answer = Column(String(4), nullable=False)  # 'A', 'B', 'C', 'D'
    explanation = Column(Text, nullable=True)
    difficulty = Column(String(20), default="medium")  # 'easy', 'medium', 'hard'
    
    concept = relationship("Concept", back_populates="questions")
    attempts = relationship("QuizAttempt", back_populates="question")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    student_id = Column(String(64), ForeignKey("students.id"), nullable=False)
    concept_id = Column(String(64), ForeignKey("concepts.id"), nullable=False)
    question_id = Column(String(64), ForeignKey("questions.id"), nullable=False)
    selected_answer = Column(String(4), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    student = relationship("Student", back_populates="quiz_attempts")
    question = relationship("Question", back_populates="attempts")


class Mastery(Base):
    __tablename__ = "mastery"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    student_id = Column(String(64), ForeignKey("students.id"), nullable=False)
    concept_id = Column(String(64), ForeignKey("concepts.id"), nullable=False)
    mastery_score = Column(Float, nullable=False)  # 0.0 to 100.0
    stability = Column(String(20), nullable=False)  # 'Strong', 'Stable', 'Weakening', 'At Risk'
    last_practiced = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    student = relationship("Student", back_populates="mastery_records")
    concept = relationship("Concept", back_populates="mastery_records")


class MasteryHistory(Base):
    __tablename__ = "mastery_history"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    student_id = Column(String(64), ForeignKey("students.id"), nullable=False)
    concept_id = Column(String(64), ForeignKey("concepts.id"), nullable=False)
    mastery_score = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)
    note = Column(String(255), nullable=True)
    
    student = relationship("Student", back_populates="history_records")


class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    student_id = Column(String(64), ForeignKey("students.id"), nullable=False)
    concept_id = Column(String(64), ForeignKey("concepts.id"), nullable=False)
    priority = Column(Integer, nullable=False)  # 1 = top priority
    priority_score = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    root_cause_concept_id = Column(String(64), nullable=True)
    impacted_concept_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    student = relationship("Student", back_populates="recommendations")
