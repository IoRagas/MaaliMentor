"""
Goals router — financial goal planning and persistence.

Lets users calculate how much to save monthly, get product recommendations,
and save/retrieve their goals.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Goal, User
from app.schemas import (
    GoalCalculateRequest,
    GoalCalculateResponse,
    GoalResponse,
    GoalSaveRequest,
    SuggestedProduct,
    GoalDepositRequest,
    GoalDepositResponse,
)
from app.services.planner_math import calculate_goal_savings, suggest_products

router = APIRouter(prefix="/api/goals", tags=["Goals"])


@router.post("/calculate", response_model=GoalCalculateResponse)
def calculate_goal(request: GoalCalculateRequest) -> GoalCalculateResponse:
    """
    Calculate how much the user needs to save monthly to reach their goal,
    adjusted for inflation. Returns product suggestions based on risk tolerance.
    """
    result = calculate_goal_savings(
        target_amount=request.target_amount,
        years=request.target_years,
        expected_annual_return=request.expected_annual_return,
        inflation_rate=request.inflation_rate,
    )

    products_raw = suggest_products(request.risk_tolerance)
    products = [SuggestedProduct(**p) for p in products_raw]

    return GoalCalculateResponse(
        future_target_amount=result["future_target_amount"],
        monthly_saving_needed=result["monthly_saving_needed"],
        total_months=result["total_months"],
        suggested_products=products,
    )


@router.post("/save", response_model=GoalResponse)
def save_goal(
    request: GoalSaveRequest,
    session: Session = Depends(get_session),
) -> GoalResponse:
    """Persist a financial goal for a user."""
    # Verify user exists
    user = session.get(User, request.user_id)
    if not user:
        user = session.get(User, 1) or session.exec(select(User)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        request.user_id = user.id

    goal = Goal(
        user_id=request.user_id,
        goal_type=request.goal_type,
        target_amount=request.target_amount,
        target_years=request.target_years,
        risk_tolerance=request.risk_tolerance,
    )
    session.add(goal)
    
    # Award +40 XP for setting a goal
    if user:
        user.current_xp += 40
        session.add(user)
        
    session.commit()
    session.refresh(goal)

    return GoalResponse(
        id=goal.id,  # type: ignore[arg-type]
        goal_type=goal.goal_type,
        target_amount=goal.target_amount,
        current_savings=goal.current_savings,
        target_years=goal.target_years,
        risk_tolerance=goal.risk_tolerance,
        created_at=goal.created_at,
    )


@router.get("/{user_id}", response_model=list[GoalResponse])
def get_user_goals(
    user_id: int,
    session: Session = Depends(get_session),
) -> list[GoalResponse]:
    """Return all saved goals for a user."""
    user = session.get(User, user_id)
    if not user:
        user = session.get(User, 1) or session.exec(select(User)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user_id = user.id

    goals = session.exec(select(Goal).where(Goal.user_id == user_id)).all()

    return [
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


@router.post("/deposit", response_model=GoalDepositResponse)
def deposit_to_goal(
    request: GoalDepositRequest,
    session: Session = Depends(get_session),
) -> GoalDepositResponse:
    """Add virtual savings to a goal and award XP."""
    # Verify user exists
    user = session.get(User, request.user_id)
    if not user:
        user = session.get(User, 1) or session.exec(select(User)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        request.user_id = user.id

    # Verify goal exists
    goal = session.get(Goal, request.goal_id)
    if not goal or goal.user_id != request.user_id:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Update goal savings
    goal.current_savings += request.amount
    session.add(goal)

    # Award XP for saving towards a goal (e.g. +20 XP)
    if user:
        user.current_xp += 20
        session.add(user)

    session.commit()
    session.refresh(goal)
    session.refresh(user)

    remaining = max(goal.target_amount - goal.current_savings, 0.0)

    return GoalDepositResponse(
        success=True,
        goal_id=goal.id,
        current_savings=goal.current_savings,
        target_amount=goal.target_amount,
        remaining_amount=remaining,
        current_xp=user.current_xp
    )
