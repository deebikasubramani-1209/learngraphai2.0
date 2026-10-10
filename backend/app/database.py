import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import get_db_url
from app.models.entities import Base

db_url = get_db_url()

# Handle SQLite vs Postgres connect_args
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Create all tables in the configured database."""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency for yielding database session in FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
