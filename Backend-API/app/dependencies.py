"""
Common dependencies for FastAPI endpoints
"""

from typing import Annotated, Generator

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.exceptions import (
    AuthenticationError,
    UserInactiveError,
    UserNotFoundError,
)
from app.core.security import verify_token
from app.database import SessionLocal
from app.models.user import User


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_current_user(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
    db: Session = Depends(get_db),
) -> User:
    if not authorization:
        raise AuthenticationError("Authorization header missing")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise AuthenticationError("Invalid authorization header. Use: Bearer <token>")

    token = parts[1]
    payload = verify_token(token)

    user_id: int | None = payload.get("user_id")
    if user_id is None:
        raise AuthenticationError("Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UserNotFoundError(user_id)

    if not user.is_active:
        raise UserInactiveError()

    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not current_user.is_active:
        raise UserInactiveError()
    return current_user


async def get_current_admin_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not current_user.is_admin:
        from app.core.exceptions import AuthorizationError
        raise AuthorizationError("Admin privileges required")
    return current_user


# Type aliases
CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentActiveUser = Annotated[User, Depends(get_current_active_user)]
CurrentAdminUser = Annotated[User, Depends(get_current_admin_user)]
DBSession = Annotated[Session, Depends(get_db)]