"""
Authentication & onboarding router.

Handles user creation via a 3-question assessment and provides
a dashboard endpoint that aggregates user data.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import ConceptMastery, Goal, User
from app.schemas import (
    ConceptMasteryItem,
    DashboardResponse,
    GoalResponse,
    OnboardingRequest,
    OnboardingResponse,
)
from app.services.graph_rag import ALL_CONCEPTS, get_next_recommended

router = APIRouter(prefix="/api/auth", tags=["Auth & Onboarding"])

# ── Assessment scoring logic ─────────────────────────────────
# Each question has 4 options scored 0-3.  Total 0-9 maps to a level.
_OPTION_SCORES: dict[str, int] = {"a": 0, "b": 1, "c": 2, "d": 3}

ASSESSMENT_QUESTIONS = [
    {
        "id": 1,
        "question": "Aap ko 'inflation' ka matlab pata hai?",
        "options": {
            "a": "Bilkul nahi",
            "b": "Suna hai lekin samajh nahi aata",
            "c": "Thora bohat samajhta/samajhti hoon",
            "d": "Achi tarah samajhta/samajhti hoon",
        },
    },
    {
        "id": 2,
        "question": "Kya aap ne kabhi mutual funds ya shares mein invest kiya hai?",
        "options": {
            "a": "Nahi, kabhi nahi",
            "b": "Nahi, lekin karna chahta/chahti hoon",
            "c": "Haan, thora bohat",
            "d": "Haan, regularly",
        },
    },
    {
        "id": 3,
        "question": "Aap apni monthly savings ka kitna hissa invest karte hain?",
        "options": {
            "a": "Kuch nahi — sab kharcha ho jata hai",
            "b": "Thora sa — bank mein rakh leta/leti hoon",
            "c": "10-30% — savings account ya committee mein",
            "d": "30%+ — mutual funds, stocks, ya real estate",
        },
    },
]


def _evaluate_level(answers: list) -> tuple[str, list[str]]:
    """
    Score the onboarding answers and determine user level.

    Returns:
        (level_name, recommended_topics)
    """
    total = sum(_OPTION_SCORES.get(a.selected_option, 0) for a in answers)

    if total <= 3:
        level = "Beginner"
        topics = ["budgeting", "saving", "emergency_funds"]
    elif total <= 6:
        level = "Intermediate"
        topics = ["inflation", "investing", "mutual_funds"]
    else:
        level = "Advanced"
        topics = ["islamic_banking", "stock_market", "diversification"]

    return level, topics


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@router.post("/onboard", response_model=OnboardingResponse)
def onboard_user(
    request: OnboardingRequest,
    session: Session = Depends(get_session),
) -> OnboardingResponse:
    """
    Create a new user, evaluate their financial literacy level,
    and initialise concept mastery entries at 0.
    """
    # Evaluate level from answers
    level, recommended = _evaluate_level(request.answers)

    # Create user
    user = User(
        username=request.username,
        email=request.email,
        user_level=level,
        onboarding_completed=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Create ConceptMastery rows for every concept (all start at 0)
    for concept in ALL_CONCEPTS:
        mastery = ConceptMastery(
            user_id=user.id,  # type: ignore[arg-type]
            concept_name=concept,
            mastery_score=0,
        )
        session.add(mastery)
    session.commit()

    return OnboardingResponse(
        user_id=user.id,  # type: ignore[arg-type]
        assigned_level=level,
        recommended_topics=recommended,
    )


@router.get("/dashboard/{user_id}", response_model=DashboardResponse)
def get_dashboard(
    user_id: int,
    session: Session = Depends(get_session),
) -> DashboardResponse:
    """Return aggregated dashboard data for a user."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Concept mastery
    mastery_stmt = select(ConceptMastery).where(ConceptMastery.user_id == user_id)
    mastery_records = session.exec(mastery_stmt).all()
    mastery_items = [
        ConceptMasteryItem(concept_name=m.concept_name, mastery_score=m.mastery_score)
        for m in mastery_records
    ]

    # Goals
    goals_stmt = select(Goal).where(Goal.user_id == user_id)
    goals = session.exec(goals_stmt).all()
    goal_items = [
        GoalResponse(
            id=g.id,  # type: ignore[arg-type]
            goal_type=g.goal_type,
            target_amount=g.target_amount,
            current_savings=g.current_savings,
            target_years=g.target_years,
            risk_tolerance=g.risk_tolerance,
            created_at=g.created_at,
        )
        for g in goals
    ]

    return DashboardResponse(
        user_id=user.id,  # type: ignore[arg-type]
        username=user.username,
        user_level=user.user_level,
        current_xp=user.current_xp,
        onboarding_completed=user.onboarding_completed,
        concept_mastery=mastery_items,
        goals=goal_items,
    )


@router.get("/assessment-questions")
def get_assessment_questions():
    """Return the onboarding assessment questions (for the frontend)."""
    return {"questions": ASSESSMENT_QUESTIONS}
