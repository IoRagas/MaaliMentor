"""
Goal planner math — sinking fund calculations and product recommendations.

Uses the PMT (payment) formula adjusted for inflation to determine how much
a user needs to save monthly to reach a financial goal.
"""

import math


def calculate_goal_savings(
    target_amount: float,
    years: int,
    expected_annual_return: float = 0.12,
    inflation_rate: float = 0.15,
) -> dict:
    """
    Calculate monthly savings needed to reach a financial goal.

    Uses the sinking-fund (future-value annuity) formula, adjusting the
    target amount for expected inflation.

    Args:
        target_amount: Goal amount in today's PKR.
        years: Number of years to reach the goal.
        expected_annual_return: Expected annual return on investments (decimal).
        inflation_rate: Expected annual inflation rate (decimal).

    Returns:
        {
            "future_target_amount": float,  # inflation-adjusted target
            "monthly_saving_needed": float,
            "total_months": int,
        }
    """
    total_months = years * 12

    # ── Adjust target for inflation ──────────────────────────
    future_target = target_amount * ((1 + inflation_rate) ** years)

    # ── Monthly rate of return ───────────────────────────────
    # Compound monthly interest rate: (1 + r)^(1/12) - 1
    monthly_rate = ((1 + expected_annual_return) ** (1 / 12)) - 1

    if monthly_rate == 0:
        # No returns — simple division
        monthly_saving = future_target / total_months
    else:
        # PMT = FV × r / ((1 + r)^n − 1)
        monthly_saving = (
            future_target
            * monthly_rate
            / (((1 + monthly_rate) ** total_months) - 1)
        )

    return {
        "future_target_amount": round(future_target, 2),
        "monthly_saving_needed": round(monthly_saving, 2),
        "total_months": total_months,
    }


def suggest_products(risk_tolerance: str) -> list[dict]:
    """
    Return a list of Pakistani financial products suited to the user's risk level.

    Args:
        risk_tolerance: One of "conservative", "moderate", "aggressive".

    Returns:
        List of product recommendation dicts.
    """
    products: dict[str, list[dict]] = {
        "conservative": [
            {
                "name": "National Savings Certificates (Regular)",
                "category": "Government Savings",
                "expected_return": "11-13%",
                "risk_level": "Very Low",
                "description": "Hukoomat ki taraf se guarantee shuda munafa. Behbood aur Defence certificates bhi available hain.",
            },
            {
                "name": "Meezan Tahaffuz Pension Fund",
                "category": "Islamic Pension",
                "expected_return": "10-12%",
                "risk_level": "Low",
                "description": "Shariah-compliant pension fund jo aap ke retirement ke liye paisa jama karta hai.",
            },
            {
                "name": "Bank Savings Account (PLS)",
                "category": "Bank Deposit",
                "expected_return": "7-9%",
                "risk_level": "Very Low",
                "description": "Profit & Loss Sharing account — aap ka paisa bank mein mehfooz rehta hai.",
            },
        ],
        "moderate": [
            {
                "name": "Al-Meezan Islamic Income Fund",
                "category": "Islamic Mutual Fund",
                "expected_return": "12-15%",
                "risk_level": "Moderate",
                "description": "Shariah-compliant income fund jo sukuk aur Islamic instruments mein invest karta hai.",
            },
            {
                "name": "National Savings — Special Savings Certificates",
                "category": "Government Savings",
                "expected_return": "12-14%",
                "risk_level": "Low",
                "description": "3 saal ki muddat ke liye government-backed certificate. Munafa har 6 maah milta hai.",
            },
            {
                "name": "ABL Islamic Income Fund",
                "category": "Islamic Mutual Fund",
                "expected_return": "11-14%",
                "risk_level": "Low-Moderate",
                "description": "Allied Bank ka Islamic income fund — diversified Shariah portfolio.",
            },
            {
                "name": "Behbood Savings Certificates",
                "category": "Government Savings",
                "expected_return": "12-14%",
                "risk_level": "Very Low",
                "description": "Senior citizens, widows aur disabled afrad ke liye khaas certificates. Monthly munafa milta hai.",
            },
        ],
        "aggressive": [
            {
                "name": "Al-Meezan Islamic Equity Fund",
                "category": "Islamic Equity Fund",
                "expected_return": "15-20%",
                "risk_level": "High",
                "description": "Pakistan Stock Exchange ke Shariah-compliant shares mein invest karta hai.",
            },
            {
                "name": "JS Islamic Fund",
                "category": "Islamic Equity Fund",
                "expected_return": "14-18%",
                "risk_level": "High",
                "description": "JS Investments ka Islamic equity fund — long-term growth ke liye.",
            },
            {
                "name": "Pakistan Stock Exchange (PSX) Direct",
                "category": "Stock Market",
                "expected_return": "Variable (historically 12-25%)",
                "risk_level": "Very High",
                "description": "Seedha shares khareedein PSX par. Zyada return ka chance hai lekin risk bhi zyada hai.",
            },
            {
                "name": "HBL Islamic Equity Fund",
                "category": "Islamic Equity Fund",
                "expected_return": "14-19%",
                "risk_level": "High",
                "description": "HBL Asset Management ka Shariah-compliant equity fund.",
            },
        ],
    }

    # Normalise risk tolerance keys from frontend
    risk_map = {
        "low": "conservative",
        "conservative": "conservative",
        "moderate": "moderate",
        "high": "aggressive",
        "aggressive": "aggressive",
    }
    normalized_risk = risk_map.get(risk_tolerance.lower(), "moderate")
    return products.get(normalized_risk, products["moderate"])
