"""
User CRUD operations - authentik 완전 제거
"""

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):

    def create(self, db: Session, *, obj_in: UserCreate | dict) -> User:
        """사용자 생성 - 비밀번호 자동 해싱"""
        if isinstance(obj_in, dict):
            data = obj_in.copy()
        else:
            data = obj_in.model_dump()

        # password → hashed_password 변환
        password = data.pop("password", None)
        data["hashed_password"] = get_password_hash(password) if password else None

        db_obj = User(**data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_email(self, db: Session, *, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    def get_by_username(self, db: Session, *, username: str) -> User | None:
        return db.query(User).filter(User.username == username).first()

    def activate(self, db: Session, *, user_id: int) -> User | None:
        user = self.get(db, id=user_id)
        if user:
            user.is_active = True
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    def deactivate(self, db: Session, *, user_id: int) -> User | None:
        user = self.get(db, id=user_id)
        if user:
            user.is_active = False
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    def remove(self, db: Session, *, id: int) -> User | None:
        return self.delete(db, id=id)


crud_user = CRUDUser(User)