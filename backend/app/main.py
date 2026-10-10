import os
import sys

# Ensure backend root is on Python sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.seed import seed_database
from app.graph_db import graph_service
from app.routes.students import router as students_router
from app.routes.concepts import router as concepts_router
from app.routes.quiz import router as quiz_router
from app.routes.graph import router as graph_router
from app.routes.analytics import router as analytics_router
from app.routes.recommendations import router as recommendations_router
from app.routes.demo import router as demo_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables are created and initial seed is present
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}...")
    init_db()
    seed_database()
    yield
    # Shutdown
    graph_service.close()
    print("Application shutdown complete.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Personalised AI Student Learning Graph & Knowledge Decay Analyzer",
    lifespan=lifespan
)

# CORS configuration for React + Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/api/health", tags=["System Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "graph_engine": "Neo4j AuraDB" if graph_service.is_neo4j_active() else "NetworkX Embedded (Active)",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# Root welcome
@app.get("/", tags=["Root"])
def root():
    return {
        "message": "LearnGraph AI API is online. Don't just track what students studied. Track what they still know.",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

# Mount sub-routers under API prefix
app.include_router(students_router, prefix=settings.API_PREFIX)
app.include_router(concepts_router, prefix=settings.API_PREFIX)
app.include_router(quiz_router, prefix=settings.API_PREFIX)
app.include_router(graph_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(recommendations_router, prefix=settings.API_PREFIX)
app.include_router(demo_router, prefix=settings.API_PREFIX)
