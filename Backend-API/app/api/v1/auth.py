"""
Authentication API endpoints
이메일/비밀번호 기반 인증 (Authentik 완전 제거)
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import settings
from app.core.exceptions import AuthenticationError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_token,
    verify_password,
)
from app.dependencies import CurrentUser, get_db
from app.models.user import User
from app.schemas.user import CurrentUserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str = Field(description="이메일")
    password: str = Field(description="비밀번호")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(description="리프레시 토큰")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    이메일 + 비밀번호로 로그인하여 JWT 토큰 발급

    - **email**: 가입된 이메일
    - **password**: 비밀번호
    """
    # 유저 조회
    user = db.query(User).filter(User.email == request.email).first()

    # 존재 여부 + 비밀번호 검증
    if not user or not user.hashed_password:
        raise AuthenticationError("이메일 또는 비밀번호가 올바르지 않습니다.")

    if not verify_password(request.password, user.hashed_password):
        raise AuthenticationError("이메일 또는 비밀번호가 올바르지 않습니다.")

    # 비활성 유저 자동 활성화 (필요 시 제거 가능)
    if not user.is_active:
        user.is_active = True
        db.commit()

    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    리프레시 토큰으로 새 액세스 토큰 발급
    """
    try:
        payload = verify_token(request.refresh_token)
    except Exception:
        raise AuthenticationError("Invalid refresh token")

    if payload.get("type") != "refresh":
        raise AuthenticationError("Invalid token type")

    user_id: int | None = payload.get("user_id")
    if user_id is None:
        raise AuthenticationError("Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise AuthenticationError("User not found")
    if not user.is_active:
        raise AuthenticationError("User is inactive")

    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    new_refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/verify")
def verify_token_endpoint(current_user: CurrentUser) -> dict:
    """토큰 유효성 검증"""
    return {"valid": True, "user_id": current_user.id}


@router.get("/me", response_model=CurrentUserResponse)
def get_current_user_info(current_user: CurrentUser) -> CurrentUserResponse:
    """현재 로그인한 사용자 정보 조회"""
    return CurrentUserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        is_active=current_user.is_active,
        is_admin=current_user.is_admin,
        full_name=current_user.full_name,
        phone=current_user.phone,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )