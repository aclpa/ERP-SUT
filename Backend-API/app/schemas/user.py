"""
User Pydantic schemas - authentik 완전 제거
"""

from typing import Optional
from pydantic import BaseModel, Field, EmailStr, ConfigDict

from app.schemas.common import TimestampSchema


class UserBase(BaseModel):
    email: EmailStr = Field(description="이메일")
    username: str = Field(min_length=3, max_length=100, description="사용자명")
    full_name: Optional[str] = Field(default=None, max_length=200, description="전체 이름")
    phone: Optional[str] = Field(
        default=None, max_length=20,
        pattern=r"^\+?[0-9\-\s()]+$",
        description="전화번호",
    )


class UserCreate(UserBase):
    """사용자 생성 스키마"""
    password: str = Field(min_length=6, description="비밀번호")
    is_admin: bool = Field(default=False, description="관리자 여부")
    avatar_url: Optional[str] = Field(default=None, max_length=500, description="프로필 이미지 URL")


class UserUpdate(BaseModel):
    """사용자 수정 스키마"""
    email: Optional[EmailStr] = Field(default=None)
    username: Optional[str] = Field(default=None, min_length=3, max_length=100)
    full_name: Optional[str] = Field(default=None, max_length=200)
    phone: Optional[str] = Field(default=None, max_length=20, pattern=r"^\+?[0-9\-\s()]+$")
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    is_active: Optional[bool] = Field(default=None)


class UserResponse(UserBase, TimestampSchema):
    """사용자 응답 스키마"""
    id: int
    avatar_url: Optional[str] = None
    is_active: bool
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)


class UserListResponse(BaseModel):
    """사용자 목록 응답 스키마"""
    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class CurrentUserResponse(UserResponse):
    pass