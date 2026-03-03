"""
User API endpoints
"""

from typing import Annotated

from fastapi import APIRouter, Path, Query, status
from sqlalchemy import select

from app.crud import crud_user
from app.dependencies import CurrentUser, DBSession
from app.core.exceptions import NotFoundError, BadRequestError
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserListResponse, UserCreate
from app.schemas.profile import UserProfileResponse
from app.schemas.common import PaginatedResponse
from app.utils import (
    paginate,
    create_paginated_response,
    QueryBuilder,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=PaginatedResponse[UserListResponse])
def list_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: DBSession = None,
    current_user: CurrentUser = None,
):
    """사용자 목록 조회"""
    builder = QueryBuilder(select(User), User)
    query = builder.build()
    items, meta = paginate(db, query, page=page, page_size=page_size)
    return create_paginated_response(items, meta)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: DBSession = None,
    current_user: CurrentUser = None,
):
    """
    새 사용자 생성

    - **email**: 이메일 (중복 불가)
    - **username**: 사용자명 (중복 불가)
    - **password**: 비밀번호 (6자 이상)
    """
    if crud_user.get_by_email(db, email=user_in.email):
        raise BadRequestError("이미 사용 중인 이메일입니다.")

    if crud_user.get_by_username(db, username=user_in.username):
        raise BadRequestError("이미 사용 중인 사용자명입니다.")

    user = crud_user.create(db, obj_in=user_in)
    return user


@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: CurrentUser):
    """현재 로그인한 사용자 정보"""
    return current_user


@router.get("/me/profile", response_model=UserProfileResponse)
def read_user_profile(current_user: CurrentUser):
    """현재 사용자 프로필 (팀, 프로젝트 포함)"""
    teams = []
    projects = []

    for membership in current_user.team_memberships:
        team = membership.team
        teams.append(team)
        for project in team.projects:
            projects.append(project)

    return {"user": current_user, "teams": teams, "projects": projects}


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: Annotated[int, Path(description="User ID")],
    user_in: UserUpdate,
    db: DBSession = None,
    current_user: CurrentUser = None,
):
    """사용자 정보 수정"""
    user = crud_user.get(db, id=user_id)
    if not user:
        raise NotFoundError(f"User {user_id} not found")
    return crud_user.update(db, db_obj=user, obj_in=user_in)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: Annotated[int, Path(description="User ID")],
    db: DBSession = None,
    current_user: CurrentUser = None,
):
    """사용자 삭제"""
    user = crud_user.get(db, id=user_id)
    if not user:
        raise NotFoundError(f"User {user_id} not found")
    crud_user.delete(db, id=user_id)