"""
Authentication utilities — JWT token creation and verification.

Used by the auth router to issue tokens on login/onboarding, and by
all protected routers as a FastAPI Depends() guard.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from app.config import settings
from app.database import get_session
from app.models import User

# ── Password hashing ─────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Return a bcrypt hash of the plain-text password."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if plain matches the stored bcrypt hash."""
    return pwd_context.verify(plain, hashed)


# ── JWT settings ─────────────────────────────────────────────
# Secret key — in production, set JWT_SECRET in the .env file.
# Falls back to a hard-coded dev secret that prints a warning at startup.
_JWT_SECRET = getattr(settings, "JWT_SECRET", "maali-mentor-dev-secret-change-in-prod")
_JWT_ALGORITHM = "HS256"
_ACCESS_TOKEN_EXPIRE_DAYS = 30  # Long-lived token for app convenience


def create_access_token(user_id: int, username: str) -> str:
    """Create and return a signed JWT access token."""
    payload = {
        "sub": str(user_id),
        "username": username,
        "iat": datetime.now(tz=timezone.utc),
        "exp": datetime.now(tz=timezone.utc) + timedelta(days=_ACCESS_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, _JWT_SECRET, algorithm=_JWT_ALGORITHM)


# ── FastAPI dependency ────────────────────────────────────────
_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    session: Session = Depends(get_session),
) -> User:
    """
    FastAPI dependency that validates the JWT from the Authorization header
    and returns the authenticated User object.

    Raises HTTP 401 if the token is missing, expired, or invalid.
    """
    _credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token. Dobara login karein.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise _credentials_exception

    try:
        payload = jwt.decode(
            credentials.credentials,
            _JWT_SECRET,
            algorithms=[_JWT_ALGORITHM],
        )
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise _credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise _credentials_exception

    user = session.get(User, user_id)
    if user is None:
        raise _credentials_exception

    return user
