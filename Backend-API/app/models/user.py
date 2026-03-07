"""
User model - authentik 완전 제거
"""

from typing import List, Optional
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, TimestampMixin


class User(Base, TimestampMixin):
    """사용자 모델"""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    team_memberships: Mapped[List["TeamMember"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    assigned_issues: Mapped[List["Issue"]] = relationship(
        foreign_keys="Issue.assignee_id", back_populates="assignee"
    )
    created_issues: Mapped[List["Issue"]] = relationship(
        foreign_keys="Issue.creator_id", back_populates="creator"
    )
    deployments: Mapped[List["Deployment"]] = relationship(
        back_populates="deployed_by_user"
    )

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, username={self.username!r}, email={self.email!r})"