"""
Simulator router — the Inflation vs. Investing game.

Players make year-by-year saving/investing decisions and experience
Pakistani economic realities (inflation, life events, returns).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth_utils import get_current_user
from app.database import get_session
from app.models import SimulatorState, User, ActivityLog
from app.schemas import (
    SimulatorStartRequest,
    SimulatorStateResponse,
    SimulatorTurnRequest,
    SimulatorTurnResponse,
)
from app.services.simulator_math import initialize_simulator, process_turn
from app.services.streak import update_streak

router = APIRouter(prefix="/api/simulator", tags=["Simulator"])



@router.post("/start", response_model=SimulatorStateResponse)
def start_simulator(
    request: SimulatorStartRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> SimulatorStateResponse:
    """
    Initialise a new simulator session for the user.

    If the user already has a simulator state, it is reset.
    """
    request.user_id = current_user.id
    # Remove any existing state
    existing = session.exec(
        select(SimulatorState).where(SimulatorState.user_id == current_user.id)
    ).first()
    if existing:
        session.delete(existing)
        session.commit()

    # Create fresh state
    state = initialize_simulator(request.starting_age, request.starting_income)

    import json
    db_state = SimulatorState(
        user_id=current_user.id,
        current_turn=state["current_turn"],
        nominal_wealth=state["nominal_wealth"],
        real_purchasing_power=state["real_purchasing_power"],
        cash_pct=state["cash_pct"],
        full_state_json=json.dumps(state),
    )
    session.add(db_state)
    
    # Log simulator start activity
    log = ActivityLog(
        user_id=current_user.id,
        activity_type="simulator_started",
        detail=f"Started the wealth simulator at age {request.starting_age}! 🎮",
        xp_earned=0
    )
    session.add(log)
    
    update_streak(current_user, session)
    session.commit()
    session.refresh(db_state)

    return SimulatorStateResponse(
        user_id=current_user.id,
        current_turn=db_state.current_turn,
        nominal_wealth=db_state.nominal_wealth,
        real_purchasing_power=db_state.real_purchasing_power,
        cash_pct=db_state.cash_pct,
        cash_value=state.get("cash_value", db_state.nominal_wealth),
        savings_value=state.get("savings_value", 0.0),
        mutual_funds_value=state.get("mutual_funds_value", 0.0),
        islamic_funds_value=state.get("islamic_funds_value", 0.0),
        gold_value=state.get("gold_value", 0.0),
        real_estate_value=state.get("real_estate_value", 0.0),
    )


@router.post("/turn", response_model=SimulatorTurnResponse)
def play_turn(
    request: SimulatorTurnRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> SimulatorTurnResponse:
    """Process one turn (year) of the simulator."""
    import json
    request.user_id = current_user.id

    # Always load full state from DB (multi-worker safe)
    state = None
    db_state = session.exec(
        select(SimulatorState).where(SimulatorState.user_id == current_user.id)
    ).first()
    if db_state and db_state.full_state_json:
        try:
            state = json.loads(db_state.full_state_json)
        except Exception as e:
            print(f"[simulator] Failed to decode full_state_json: {e}")

    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Simulator session not found. POST /api/simulator/start pehle call karein.",
        )

    # Validate saving method (only if allocations are not provided)
    if request.allocation_cash is None:
        valid_methods = {"cash", "savings_account", "mutual_funds", "islamic_funds"}
        if request.decision_saving_method not in valid_methods:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid saving method. Choose from: {', '.join(valid_methods)}",
            )

    # Run the math
    new_state = process_turn(
        state=state,
        decision_lifestyle_spend=request.decision_lifestyle_spend,
        allocation_cash=request.allocation_cash,
        allocation_savings=request.allocation_savings,
        allocation_mutual_funds=request.allocation_mutual_funds,
        allocation_islamic_funds=request.allocation_islamic_funds,
        allocation_gold=request.allocation_gold,
        allocation_real_estate=request.allocation_real_estate,
        decision_saving_method=request.decision_saving_method,
        rebalance=request.rebalance or False,
    )
    # No in-memory cache update — always persist to DB

    # Persist summary & full state to DB
    db_state = session.exec(
        select(SimulatorState).where(SimulatorState.user_id == current_user.id)
    ).first()
    if db_state:
        db_state.current_turn = new_state["current_turn"]
        db_state.nominal_wealth = new_state["nominal_wealth"]
        db_state.real_purchasing_power = new_state["real_purchasing_power"]
        db_state.cash_pct = new_state["cash_pct"]
        db_state.full_state_json = json.dumps(new_state)
        session.add(db_state)
        
        # Award XP for playing simulator turn
        current_user.current_xp += 30
        session.add(current_user)
        
        # Log simulator turn activity
        log = ActivityLog(
            user_id=current_user.id,
            activity_type="simulator_turn",
            detail=f"Advanced simulator to Year {new_state['current_turn']} (Wealth: PKR {new_state['nominal_wealth']:,.0f}) 📈",
            xp_earned=30
        )
        session.add(log)
            
        update_streak(current_user, session)
        session.commit()

    return SimulatorTurnResponse(
        new_turn=new_state["current_turn"],
        nominal_wealth=new_state["nominal_wealth"],
        real_purchasing_power=new_state["real_purchasing_power"],
        purchasing_power_loss_pct=new_state["purchasing_power_loss_pct"],
        current_inflation_rate=new_state["inflation_rate"],
        event_triggered=new_state.get("event_triggered"),
        cash_value=new_state["cash_value"],
        invested_value=new_state["invested_value"],
        monthly_income=new_state["monthly_income"],
        savings_value=new_state.get("savings_value", 0.0),
        mutual_funds_value=new_state.get("mutual_funds_value", 0.0),
        islamic_funds_value=new_state.get("islamic_funds_value", 0.0),
        gold_value=new_state.get("gold_value", 0.0),
        real_estate_value=new_state.get("real_estate_value", 0.0),
    )


@router.get("/state/{user_id}", response_model=SimulatorStateResponse)
def get_state(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> SimulatorStateResponse:
    """Return the current simulator state for a user."""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this state")
    db_state = session.exec(
        select(SimulatorState).where(SimulatorState.user_id == user_id)
    ).first()
    if not db_state:
        raise HTTPException(status_code=404, detail="No simulator state found for this user.")

    import json
    state = {}
    if db_state.full_state_json:
        try:
            state = json.loads(db_state.full_state_json)
        except Exception:
            pass

    return SimulatorStateResponse(
        user_id=user_id,
        current_turn=db_state.current_turn,
        nominal_wealth=db_state.nominal_wealth,
        real_purchasing_power=db_state.real_purchasing_power,
        cash_pct=db_state.cash_pct,
        cash_value=state.get("cash_value", db_state.nominal_wealth),
        savings_value=state.get("savings_value", 0.0),
        mutual_funds_value=state.get("mutual_funds_value", 0.0),
        islamic_funds_value=state.get("islamic_funds_value", 0.0),
        gold_value=state.get("gold_value", 0.0),
        real_estate_value=state.get("real_estate_value", 0.0),
    )
