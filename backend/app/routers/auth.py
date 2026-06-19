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
    LoginRequest,
    LoginResponse,
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
    {
        "id": 4,
        "question": "If you invest Rs. 100,000 with a 10% annual return compounded annually, how much will you have after 2 years?",
        "options": {
            "a": "Rs. 110,000",
            "b": "Rs. 120,000",
            "c": "Rs. 121,000",
            "d": "Rs. 130,000",
        },
    },
]


def _evaluate_level(answers: list) -> tuple[str, list[str]]:
    """
    Score the onboarding answers and determine user level.

    Returns:
        (level_name, recommended_topics)
    """
    # Evaluate level based on the first 3 self-assessment questions
    eval_answers = [a for a in answers if a.question_id in (1, 2, 3)]
    total = sum(_OPTION_SCORES.get(a.selected_option, 0) for a in eval_answers)

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

    # If the user answered the hard question (ID: 4) correctly ('c'), they start at Level 3
    start_level = 1
    for ans in request.answers:
        if ans.question_id == 4 and ans.selected_option.lower().strip() == "c":
            start_level = 3
            break

    # Create user with starting XP matching their level (200 XP per cleared level)
    start_xp = (start_level - 1) * 200
    user = User(
        username=request.username,
        password=request.password,
        email=request.email,
        user_level=level,
        current_level=start_level,
        current_xp=start_xp,
        onboarding_completed=True,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Map levels to concepts to initialize mastery scores of completed levels
    local_level_to_concept = {
        1: "budgeting",
        2: "saving",
        3: "emergency_funds",
        4: "inflation",
        5: "investing",
        6: "mutual_funds",
        7: "islamic_banking",
        8: "stock_market",
        9: "diversification",
        10: "tax_filer",
    }
    concept_to_lvl = {v: k for k, v in local_level_to_concept.items()}

    # Create ConceptMastery rows for every concept (prerequisites start at 85%, others at 0%)
    for concept in ALL_CONCEPTS:
        concept_lvl = concept_to_lvl.get(concept, 1)
        initial_score = 85 if concept_lvl < start_level else 0
        mastery = ConceptMastery(
            user_id=user.id,  # type: ignore[arg-type]
            concept_name=concept,
            mastery_score=initial_score,
        )
        session.add(mastery)
    session.commit()

    return OnboardingResponse(
        user_id=user.id,  # type: ignore[arg-type]
        assigned_level=level,
        recommended_topics=recommended,
        current_level=start_level,
    )


@router.post("/login", response_model=LoginResponse)
def login_user(
    request: LoginRequest,
    session: Session = Depends(get_session),
) -> LoginResponse:
    """
    Authenticate a user by username and password.
    """
    user = session.exec(
        select(User).where(User.username == request.username)
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.password != request.password:
        raise HTTPException(status_code=401, detail="Invalid password")
        
    return LoginResponse(
        user_id=user.id,  # type: ignore[arg-type]
        username=user.username,
        user_level=user.user_level,
        current_level=user.current_level,
    )


@router.get("/dashboard/{user_id}", response_model=DashboardResponse)
def get_dashboard(
    user_id: int,
    session: Session = Depends(get_session),
) -> DashboardResponse:
    """Return aggregated dashboard data for a user."""
    user = session.get(User, user_id)
    if not user:
        user = session.get(User, 1) or session.exec(select(User)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_id = user.id

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
        current_level=user.current_level,
        current_xp=user.current_xp,
        onboarding_completed=user.onboarding_completed,
        concept_mastery=mastery_items,
        goals=goal_items,
    )


@router.get("/assessment-questions")
def get_assessment_questions():
    """Return the onboarding assessment questions (for the frontend)."""
    return {"questions": ASSESSMENT_QUESTIONS}
