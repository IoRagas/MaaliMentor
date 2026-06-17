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


from sqlalchemy import text

def create_db_and_tables() -> None:
    """Create all SQLModel tables if they don't already exist."""
    SQLModel.metadata.create_all(engine)
    
    # Auto-migration: check if users table is missing columns
    with engine.begin() as connection:
        try:
            # Check users table info
            result = connection.execute(text("PRAGMA table_info(users)")).fetchall()
            columns = [row[1] for row in result]
            if "current_level" not in columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN current_level INTEGER DEFAULT 1"))
                print("[database] Migrated users table: added current_level column.")
            if "password" not in columns:
                connection.execute(text("ALTER TABLE users ADD COLUMN password VARCHAR DEFAULT ''"))
                print("[database] Migrated users table: added password column.")
        except Exception as e:
            print(f"[database] Migration warning: {e}")

    # Ensure demo1 user exists
    from app.models import User, ConceptMastery
    from app.services.graph_rag import ALL_CONCEPTS
    with Session(engine) as session:
        try:
            demo_user = session.query(User).filter(User.username == "demo1").first()
            if not demo_user:
                demo_user = User(
                    username="demo1",
                    password="demo123",
                    email="demo1@example.com",
                    user_level="Intermediate",
                    current_level=3,
                    onboarding_completed=True,
                )
                session.add(demo_user)
                session.commit()
                session.refresh(demo_user)
                
                # Pre-initialize ConceptMastery for demo user
                for concept in ALL_CONCEPTS:
                    mastery = ConceptMastery(
                        user_id=demo_user.id,
                        concept_name=concept,
                        mastery_score=0,
                    )
                    session.add(mastery)
                session.commit()
                print("[database] Pre-created demo user: demo1 / demo123")
        except Exception as e:
            print(f"[database] Demo user creation warning: {e}")


def get_session():
    """FastAPI dependency that yields a database session per request."""
    with Session(engine) as session:
        yield session
