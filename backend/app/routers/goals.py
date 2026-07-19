"""
Goals router — financial goal planning and persistence.

Lets users calculate how much to save monthly, get product recommendations,
and save/retrieve their goals.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth_utils import get_current_user
from app.database import get_session
from app.models import Goal, User, ActivityLog
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
from app.services.streak import update_streak

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
    current_user: User = Depends(get_current_user),
) -> GoalResponse:
    """Persist a financial goal for a user."""
    # Force use of authenticated user ID for safety
    request.user_id = current_user.id

    goal = Goal(
        user_id=request.user_id,
        goal_type=request.goal_type,
        target_amount=request.target_amount,
        target_years=request.target_years,
        risk_tolerance=request.risk_tolerance,
    )
    session.add(goal)
    
    # Award +40 XP for setting a goal
    current_user.current_xp += 40
    session.add(current_user)
        
    # Log goal creation activity
    log = ActivityLog(
        user_id=current_user.id,
        activity_type="goal_created",
        detail=f"Created saving goal for: {request.goal_type.replace('_', ' ').title()} 🎯",
        xp_earned=40
    )
    session.add(log)
    
    update_streak(current_user, session)
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
    current_user: User = Depends(get_current_user),
) -> list[GoalResponse]:
    """Return all saved goals for a user."""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access these goals")

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
    current_user: User = Depends(get_current_user),
) -> GoalDepositResponse:
    """Add virtual savings to a goal and award XP."""
    request.user_id = current_user.id

    # Verify goal exists
    goal = session.get(Goal, request.goal_id)
    if not goal or goal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Update goal savings
    goal.current_savings += request.amount
    session.add(goal)

    # Award XP for saving towards a goal (e.g. +20 XP)
    current_user.current_xp += 20
    session.add(current_user)

    # Log deposit activity
    log = ActivityLog(
        user_id=current_user.id,
        activity_type="deposit",
        detail=f"Saved PKR {request.amount:,.0f} towards goal: {goal.goal_type.replace('_', ' ').title()} 💰",
        xp_earned=20
    )
    session.add(log)

    update_streak(current_user, session)
    session.commit()
    session.refresh(goal)
    session.refresh(current_user)

    remaining = max(goal.target_amount - goal.current_savings, 0.0)

    return GoalDepositResponse(
        success=True,
        goal_id=goal.id,
        current_savings=goal.current_savings,
        target_amount=goal.target_amount,
        remaining_amount=remaining,
        current_xp=user.current_xp
    )


@router.delete("/{goal_id}", status_code=204)
def delete_goal(
    goal_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a goal by ID. Requires the owning user_id for authorization."""
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this goal")
    session.delete(goal)
    session.commit()
