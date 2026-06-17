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
        "nominal_wealth": 50000.0,
        "real_purchasing_power": 50000.0,
        "cumulative_inflation_factor": 1.0,  # base-year = 1.0
        "cash_value": 50000.0,
        "savings_value": 0.0,
        "mutual_funds_value": 0.0,
        "islamic_funds_value": 0.0,
        "gold_value": 0.0,
        "real_estate_value": 0.0,
        "invested_value": 0.0,
        "cash_pct": 100.0,
        "event_triggered": None,
    }


def process_turn(
    state: dict,
    decision_lifestyle_spend: float,
    allocation_cash: Optional[float] = None,
    allocation_savings: Optional[float] = None,
    allocation_mutual_funds: Optional[float] = None,
    allocation_islamic_funds: Optional[float] = None,
    allocation_gold: Optional[float] = None,
    allocation_real_estate: Optional[float] = None,
    decision_saving_method: Optional[str] = None,
) -> dict:
    """
    Simulate one year of financial life.

    Args:
        state: Current state dict from the last turn.
        decision_lifestyle_spend: Fraction of annual income spent on lifestyle (0-1).
        allocation_cash: Percent of savings to keep in Cash.
        allocation_savings: Percent of savings to allocate to PLS Savings Account.
        allocation_mutual_funds: Percent of savings to allocate to Mutual Funds.
        allocation_islamic_funds: Percent of savings to allocate to Islamic Funds.
        allocation_gold: Percent of savings to allocate to Gold.
        allocation_real_estate: Percent of savings to allocate to Real Estate.
        decision_saving_method: Legacy saving method (for backwards compatibility).

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

    # Fallback to single saving method if allocations are not provided
    if allocation_cash is None:
        method = decision_saving_method or "cash"
        alloc_cash = 1.0 if method == "cash" else 0.0
        alloc_savings = 1.0 if method == "savings_account" else 0.0
        alloc_mutual = 1.0 if method == "mutual_funds" else 0.0
        alloc_islamic = 1.0 if method == "islamic_funds" else 0.0
        alloc_gold = 0.0
        alloc_real_estate = 0.0
    else:
        alloc_cash = allocation_cash
        alloc_savings = allocation_savings
        alloc_mutual = allocation_mutual_funds
        alloc_islamic = allocation_islamic_funds
        alloc_gold = allocation_gold or 0.0
        alloc_real_estate = allocation_real_estate or 0.0
        
        # Normalize to sum up to 1.0 if needed
        total_alloc = alloc_cash + alloc_savings + alloc_mutual + alloc_islamic + alloc_gold + alloc_real_estate
        if total_alloc > 0:
            alloc_cash /= total_alloc
            alloc_savings /= total_alloc
            alloc_mutual /= total_alloc
            alloc_islamic /= total_alloc
            alloc_gold /= total_alloc
            alloc_real_estate /= total_alloc
        else:
            alloc_cash = 1.0

    # ── 3. Asset Returns ─────────────────────────────────────
    # Bank savings tracks inflation (PLS rates follow inflation policy)
    rate_savings = max(0.05, inflation_rate - 0.02)
    # Mutual funds volatile (average 16%)
    rate_mutual = random.normalvariate(0.16, 0.12)
    # Islamic funds slightly less volatile (average 14%)
    rate_islamic = random.normalvariate(0.14, 0.08)
    # Gold tracks inflation + extra random yield (inflation hedge)
    rate_gold = inflation_rate + random.uniform(-0.04, 0.08)
    # Real estate stable growth (average 12%)
    rate_real_estate = random.normalvariate(0.12, 0.03)

    # Load old asset values (fallback to 0.0 if not initialized)
    old_cash = state.get("cash_value", 0.0)
    old_savings = state.get("savings_value", 0.0)
    old_mutual = state.get("mutual_funds_value", 0.0)
    old_islamic = state.get("islamic_funds_value", 0.0)
    old_gold = state.get("gold_value", 0.0)
    old_real_estate = state.get("real_estate_value", 0.0)

    # Grow existing assets (cash has 0% return rate)
    new_cash = old_cash
    new_savings = old_savings * (1 + rate_savings)
    new_mutual = old_mutual * (1 + rate_mutual)
    new_islamic = old_islamic * (1 + rate_islamic)
    new_gold = old_gold * (1 + rate_gold)
    new_real_estate = old_real_estate * (1 + rate_real_estate)

    # Allocate new savings
    new_cash += annual_saving * alloc_cash
    new_savings += annual_saving * alloc_savings
    new_mutual += annual_saving * alloc_mutual
    new_islamic += annual_saving * alloc_islamic
    new_gold += annual_saving * alloc_gold
    new_real_estate += annual_saving * alloc_real_estate

    # ── 4. Random life event ─────────────────────────────────
    event_triggered = None
    for event in LIFE_EVENTS:
        if random.random() < event["probability"]:
            event_name = event["name"]
            
            if "wealth_impact" in event:
                impact = event["wealth_impact"]
                if impact < 0:
                    # Check for Emergency Fund Buffer (cash + savings >= 3 * monthly_income)
                    monthly_income = state["monthly_income"]
                    if (new_cash + new_savings) >= (3 * monthly_income):
                        mitigated_impact = int(impact * 0.4)
                        event_triggered = f"{event_name} (Emergency Fund ne aap ko 60% nuqsaan se bacha liya!)"
                        impact = mitigated_impact
                    else:
                        event_triggered = f"{event_name} (Emergency Fund na hone ki wajah se poora nuqsaan hua.)"
                
                # Apply wealth impact (deduct from cash first, then savings, then other investments)
                if impact < 0:
                    abs_impact = abs(impact)
                    if new_cash >= abs_impact:
                        new_cash -= abs_impact
                    elif (new_cash + new_savings) >= abs_impact:
                        shortfall = abs_impact - new_cash
                        new_cash = 0
                        new_savings -= shortfall
                    else:
                        shortfall = abs_impact - new_cash - new_savings
                        new_cash = 0
                        new_savings = 0
                        # Pro-rata deduction from other investment assets
                        other_total = new_mutual + new_islamic + new_gold + new_real_estate
                        if other_total >= shortfall:
                            ratio = (other_total - shortfall) / other_total
                            new_mutual *= ratio
                            new_islamic *= ratio
                            new_gold *= ratio
                            new_real_estate *= ratio
                        else:
                            new_mutual = 0
                            new_islamic = 0
                            new_gold = 0
                            new_real_estate = 0
                else:
                    new_cash += impact
                    if not event_triggered:
                        event_triggered = event_name

            elif "income_impact_pct" in event:
                annual_income *= (1 + event["income_impact_pct"])
                event_triggered = event_name
                
            break  # Only one event per turn

    # ── 5. Calculate totals ──────────────────────────────────
    nominal_wealth = new_cash + new_savings + new_mutual + new_islamic + new_gold + new_real_estate
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
        "savings_value": round(new_savings, 2),
        "mutual_funds_value": round(new_mutual, 2),
        "islamic_funds_value": round(new_islamic, 2),
        "gold_value": round(new_gold, 2),
        "real_estate_value": round(new_real_estate, 2),
        "invested_value": round(new_savings + new_mutual + new_islamic + new_gold + new_real_estate, 2),
        "cash_pct": round(cash_pct, 2),
        "inflation_rate": round(inflation_rate, 4),
        "purchasing_power_loss_pct": pp_loss_pct,
        "event_triggered": event_triggered,
    }
    return new_state
