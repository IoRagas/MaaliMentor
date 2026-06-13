"""
Simulator math engine for the Inflation vs. Investing game.

Each "turn" represents one year of the user's financial life. The engine
models dynamic Pakistani inflation, investment returns by method, and
random life events that affect wealth.
"""

import random
from typing import Optional

# ── Return rates by saving / investing method (annual %) ─────
RETURN_RATES: dict[str, float] = {
    "cash": 0.00,              # Cash under the mattress — no return
    "savings_account": 0.08,   # ~8% typical PLS account
    "mutual_funds": 0.16,      # ~16% equity / balanced funds
    "islamic_funds": 0.14,     # ~14% Shariah-compliant funds
}

# ── Random life events with their financial impact ───────────
LIFE_EVENTS: list[dict] = [
    {
        "name": "Medical Emergency — Beemar ho gaye!",
        "wealth_impact": -50000,
        "probability": 0.15,
    },
    {
        "name": "Shaadi ka kharcha — Wedding expense!",
        "wealth_impact": -150000,
        "probability": 0.08,
    },
    {
        "name": "Salary Raise — Talab mein izafa!",
        "income_impact_pct": 0.15,
        "probability": 0.20,
    },
    {
        "name": "Annual Bonus — Bohni mil gayi!",
        "wealth_impact": 30000,
        "probability": 0.18,
    },
    {
        "name": "Ghar ki repair — House maintenance!",
        "wealth_impact": -25000,
        "probability": 0.12,
    },
    {
        "name": "Prize Bond laga! — You won a small prize!",
        "wealth_impact": 15000,
        "probability": 0.05,
    },
]


def initialize_simulator(starting_age: int, starting_income: float) -> dict:
    """
    Create the initial state dict for a new simulator session.

    Args:
        starting_age: Player's starting age (18-60).
        starting_income: Monthly income in PKR.

    Returns:
        State dictionary with all fields needed to run turns.
    """
    annual_income = starting_income * 12
    return {
        "current_turn": 0,
        "age": starting_age,
        "monthly_income": starting_income,
        "annual_income": annual_income,
        "nominal_wealth": 0.0,
        "real_purchasing_power": 0.0,
        "cumulative_inflation_factor": 1.0,  # base-year = 1.0
        "cash_value": 0.0,
        "invested_value": 0.0,
        "cash_pct": 100.0,
        "event_triggered": None,
    }


def process_turn(
    state: dict,
    decision_saving_method: str,
    decision_lifestyle_spend: float,
) -> dict:
    """
    Simulate one year of financial life.

    Args:
        state: Current state dict from the last turn.
        decision_saving_method: How the user saves/invests this year.
        decision_lifestyle_spend: Fraction of annual income spent on lifestyle (0-1).

    Returns:
        Updated state dict with new wealth, inflation, and any event.
    """
    # ── 1. Dynamic inflation for this year (10-25%) ──────────
    inflation_rate = round(random.uniform(0.10, 0.25), 4)
    new_cumulative = state["cumulative_inflation_factor"] * (1 + inflation_rate)

    # ── 2. Income & saving ───────────────────────────────────
    annual_income = state["annual_income"]
    living_expenses = annual_income * decision_lifestyle_spend
    annual_saving = max(annual_income - living_expenses, 0.0)

    # ── 3. Apply investment return ───────────────────────────
    return_rate = RETURN_RATES.get(decision_saving_method, 0.0)

    # Existing investments grow
    old_invested = state.get("invested_value", 0.0)
    old_cash = state.get("cash_value", 0.0)

    if decision_saving_method == "cash":
        new_cash = old_cash + annual_saving
        new_invested = old_invested * (1 + RETURN_RATES.get("mutual_funds", 0.0) if old_invested > 0 else 1)
        # Keep old investments growing at their rate, new money is cash
        new_invested = old_invested * (1 + 0.14)  # assume existing invested at avg rate
        new_cash = old_cash + annual_saving
    else:
        new_cash = old_cash  # cash doesn't grow
        new_invested = (old_invested + annual_saving) * (1 + return_rate)

    # ── 4. Random life event ─────────────────────────────────
    event_triggered: Optional[str] = None
    for event in LIFE_EVENTS:
        if random.random() < event["probability"]:
            event_triggered = event["name"]

            if "wealth_impact" in event:
                impact = event["wealth_impact"]
                # Deduct from cash first, then invested
                if impact < 0:
                    if new_cash >= abs(impact):
                        new_cash += impact
                    else:
                        shortfall = abs(impact) - new_cash
                        new_cash = 0
                        new_invested = max(new_invested - shortfall, 0)
                else:
                    new_cash += impact

            if "income_impact_pct" in event:
                annual_income *= (1 + event["income_impact_pct"])

            break  # Only one event per turn

    # ── 5. Calculate totals ──────────────────────────────────
    nominal_wealth = new_cash + new_invested
    real_purchasing_power = nominal_wealth / new_cumulative

    # Purchasing power loss relative to what nominal_wealth *should* buy
    pp_loss_pct = 0.0
    if nominal_wealth > 0:
        pp_loss_pct = round((1 - real_purchasing_power / nominal_wealth) * 100, 2)

    # Cash percentage
    cash_pct = (new_cash / nominal_wealth * 100) if nominal_wealth > 0 else 100.0

    # ── 6. Build new state ───────────────────────────────────
    new_state = {
        "current_turn": state["current_turn"] + 1,
        "age": state["age"] + 1,
        "monthly_income": annual_income / 12,
        "annual_income": annual_income,
        "nominal_wealth": round(nominal_wealth, 2),
        "real_purchasing_power": round(real_purchasing_power, 2),
        "cumulative_inflation_factor": round(new_cumulative, 6),
        "cash_value": round(new_cash, 2),
        "invested_value": round(new_invested, 2),
        "cash_pct": round(cash_pct, 2),
        "inflation_rate": round(inflation_rate, 4),
        "purchasing_power_loss_pct": pp_loss_pct,
        "event_triggered": event_triggered,
    }
    return new_state
