"""
Security utilities for JWT token handling and password hashing
JWT 토큰 처리 및 비밀번호 해싱을 위한 보안 유틸리티
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings
from app.core.exceptions import InvalidTokenError, TokenExpiredError

# --- bcrypt 호환성 패치 시작 ---
# passlib 1.7.4가 최신 bcrypt(4.0.0 이상)의 버전을 확인하지 못하는 문제를 해결합니다.
import bcrypt
if not hasattr(bcrypt, "__about__"):
    class BcryptAbout:
        __version__ = bcrypt.__version__
    bcrypt.__about__ = BcryptAbout()
# --- bcrypt 호환성 패치 끝 ---

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None
) -> str:
    """
    JWT Access Token 생성
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None
) -> str:
    """
    JWT Refresh Token 생성
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=7)

    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "refresh"
    })
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> dict[str, Any]:
    """
    JWT 토큰 검증 및 디코딩
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise TokenExpiredError()
    except JWTError:
        raise InvalidTokenError()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    비밀번호 검증
    """
    # 위 패치가 적용되면 이 함수가 정상적으로 작동합니다.
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    비밀번호 해싱
    """
    return pwd_context.hash(password)
