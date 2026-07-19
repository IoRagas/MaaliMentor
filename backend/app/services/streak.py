"""
Daily streak tracking service.

Handles checking and incrementing consecutive days active.
"""

from datetime import date, timedelta
from sqlmodel import Session
from app.models import User, ActivityLog


def update_streak(user: User, session: Session) -> tuple[int, bool]:
    """
    Updates the user's daily activity streak.
    
    Returns:
        (current_streak, was_incremented)
    """
    today_str = date.today().isoformat()
    yesterday_str = (date.today() - timedelta(days=1)).isoformat()
    
    # Already logged active today
    if user.last_active_date == today_str:
        return user.current_streak, False
        
    was_incremented = False
    
    # Active yesterday -> increment streak
    if user.last_active_date == yesterday_str:
        user.current_streak += 1
        was_incremented = True
    else:
        # Streak broken or first activity ever -> reset to 1
        user.current_streak = 1
        was_incremented = True
        
    user.longest_streak = max(user.longest_streak, user.current_streak)
    user.last_active_date = today_str
    
    session.add(user)
    
    # Log streak activity if incremented or reset
    if was_incremented:
        log = ActivityLog(
            user_id=user.id,
            activity_type="daily_checkin",
            detail=f"Daily streak update: {user.current_streak} days active! 🔥",
            xp_earned=10 if user.current_streak > 1 else 0
        )
        if user.current_streak > 1:
            user.current_xp += 10
            session.add(user)
        session.add(log)
        
    session.commit()
    
    return user.current_streak, was_incremented
