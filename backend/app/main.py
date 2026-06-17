"""
Maali Mentor — FastAPI application entry point.

An AI-powered Urdu financial literacy coach that teaches Pakistani users
about saving, investing, inflation, and Islamic finance through:
- Voice & text-based tutoring (Graph-RAG + LLM)
- An inflation vs. investing simulator game
- A goal planner with sinking-fund calculations

Run with:
    uvicorn app.main:app --reload
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import create_db_and_tables
from app.services.graph_rag import initialize_vector_db
from app.services.speech import warmup_speech_models
from app.routers import auth, goals, quiz, simulator, tutor
import asyncio


# ── Lifespan (startup / shutdown) ────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables, initialize vector search index, and warm up model on startup."""
    create_db_and_tables()
    initialize_vector_db()
    
    # Warm up local Whisper model in the background so it doesn't block boot,
    # but is warm before the first user request arrives.
    asyncio.create_task(asyncio.to_thread(warmup_speech_models))
    yield


# ── App instance ─────────────────────────────────────────────
app = FastAPI(
    title="Maali Mentor API",
    description=(
        "AI-powered Urdu financial literacy coach — "
        "teaching saving, investing, and Islamic finance to Pakistani users."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS (allow all origins for hackathon) ───────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (audio, etc.) ───────────────────────────────
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
(STATIC_DIR / "audio").mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# ── Routers ──────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(tutor.router)
app.include_router(simulator.router)
app.include_router(goals.router)
app.include_router(quiz.router)


# ── Root endpoint ────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    """Welcome / health-check endpoint."""
    return {
        "app": "Maali Mentor",
        "tagline": "Aap ka apna Urdu financial coach!",
        "version": "0.1.0",
        "docs": "/docs",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "mock_llm": settings.USE_MOCK_LLM,
        "mock_speech": settings.USE_MOCK_SPEECH,
        "database": settings.DATABASE_URL,
    }
