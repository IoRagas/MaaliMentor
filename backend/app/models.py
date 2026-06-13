"""
SQLModel table definitions for Maali Mentor.

All domain entities — User, ConceptMastery, Goal, SimulatorState — are defined
here as SQLModel classes (table=True) so they serve as both ORM models and
Pydantic schemas for internal use.
"""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """A learner on the Maali Mentor platform."""

    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    email: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    current_xp: int = Field(default=0)
    user_level: str = Field(default="Beginner")  # Beginner | Intermediate | Advanced
    onboarding_completed: bool = Field(default=False)


class ConceptMastery(SQLModel, table=True):
    """Tracks how well a user understands a specific financial concept (0-100)."""

    __tablename__ = "concept_mastery"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    concept_name: str = Field(index=True)
    mastery_score: int = Field(default=0, ge=0, le=100)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Goal(SQLModel, table=True):
    """A financial goal the user is working towards."""

    __tablename__ = "goals"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    goal_type: str  # e.g. "emergency_fund", "wedding", "education", "hajj"
    target_amount: float
    current_savings: float = Field(default=0.0)
    target_years: int
    risk_tolerance: str = Field(default="moderate")  # conservative | moderate | aggressive
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SimulatorState(SQLModel, table=True):
    """Persisted state for the inflation / investing simulator."""

    __tablename__ = "simulator_states"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    current_turn: int = Field(default=0)
    nominal_wealth: float = Field(default=0.0)
    real_purchasing_power: float = Field(default=0.0)
    cash_pct: float = Field(default=100.0)  # % of wealth held as cash
    full_state_json: Optional[str] = Field(default="{}")
    created_at: datetime = Field(default_factory=datetime.utcnow)
