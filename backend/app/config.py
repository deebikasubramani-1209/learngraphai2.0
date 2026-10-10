import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = ConfigDict(extra="allow", env_file=".env")

    APP_NAME: str = "LearnGraph AI"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Server Binding
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Allowed CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Database Configuration (Supabase PostgreSQL with automatic SQLite fallback)
    SUPABASE_DB_URL: str = ""
    DATABASE_URL: str = "sqlite:///./learngraph.db"
    
    # Neo4j AuraDB Configuration (with automatic in-memory fallback)
    NEO4J_URI: str = ""
    NEO4J_USERNAME: str = ""
    NEO4J_PASSWORD: str = ""
    
    # Optional LLM API Key (Gemini)
    GEMINI_API_KEY: str = ""
    
    # Configurable Knowledge Stability & Decay Thresholds
    THRESHOLD_STRONG: float = 85.0     # >= 85: Strong
    THRESHOLD_STABLE: float = 70.0     # 70 - 84: Stable
    THRESHOLD_WEAKENING: float = 50.0  # 50 - 69: Weakening (< 50: At Risk)
    
    # Memory Decay Parameters (Ebbinghaus-based estimate calibrated to 90% -> 55% at 21 days)
    DEFAULT_STABILITY_FACTOR: float = 24.0  # Days scale
    MIN_DECAY_FLOOR: float = 30.0           # Retention floor for established concepts
    
    # Revision Priority Weights
    WEIGHT_MASTERY_DEFICIT: float = 0.35
    WEIGHT_DECAY_URGENCY: float = 0.25
    WEIGHT_DOWNSTREAM_IMPACT: float = 0.40

settings = Settings()

def get_db_url() -> str:
    """Return Supabase Postgres URL if present, otherwise SQLite local file."""
    if settings.SUPABASE_DB_URL and settings.SUPABASE_DB_URL.strip():
        return settings.SUPABASE_DB_URL.strip()
    return settings.DATABASE_URL

def get_data_dir() -> str:
    """Walk upwards to reliably locate the data directory containing seeded JSON fixtures."""
    curr = os.path.abspath(os.path.dirname(__file__))
    for _ in range(5):
        candidate = os.path.join(curr, "data")
        if os.path.exists(os.path.join(candidate, "concepts.json")):
            return candidate
        curr = os.path.dirname(curr)
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))

