"""
Security utilities for JWT token handling and password hashing
Direct bcrypt usage to avoid passlib compatibility issues with Python 3.13
"""

from datetime import datetime, timedelta, timezone
from typing import Any
import bcrypt  # passlib 대신 직접 사용

from jose import JWTError, jwt
from app.config import settings
from app.core.exceptions import InvalidTokenError, TokenExpiredError

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    비밀번호 검증 (bcrypt 직접 사용)
    """
    try:
        # 평문 비밀번호와 해시된 비밀번호를 각각 bytes로 변환하여 비교합니다.
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        print(f"❌ bcrypt 검증 중 오류 발생: {e}")
        return False

def get_password_hash(password: str) -> str:
    """
    비밀번호 해싱 (bcrypt 직접 사용)
    """
    # salt 생성 및 해싱
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta if expires_delta else timedelta(days=7))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise TokenExpiredError()
    except JWTError:
        raise InvalidTokenError()
