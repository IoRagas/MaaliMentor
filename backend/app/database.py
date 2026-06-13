"""
Database engine and session management.

Uses SQLite via SQLModel for hackathon simplicity.
Call `create_db_and_tables()` once at startup to ensure all tables exist.
"""

from sqlmodel import Session, SQLModel, create_engine

from app.config import settings

# ── Engine ────────────────────────────────────────────────────
# connect_args needed for SQLite to allow multi-threaded access in FastAPI
engine = create_engine(
    settings.DATABASE_URL,
    echo=(settings.ENVIRONMENT == "development"),
    connect_args={"check_same_thread": False},
)


def create_db_and_tables() -> None:
    """Create all SQLModel tables if they don't already exist."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency that yields a database session per request."""
    with Session(engine) as session:
        yield session
