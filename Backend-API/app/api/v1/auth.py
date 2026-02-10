"""

Authentication API endpoints

인증 관련 API 엔드포인트

"""


from app.core.security import verify_password, get_password_hash

from datetime import timedelta

from typing import Annotated

from urllib.parse import urlencode



from fastapi import APIRouter, Depends

from pydantic import BaseModel, Field

from sqlalchemy.orm import Session



from app.config import settings

from app.core.auth import (

    AuthentikClient,

    get_or_create_user_from_authentik,

)

from app.core.exceptions import AuthenticationError

from app.core.security import create_access_token, create_refresh_token, verify_token

from app.dependencies import CurrentUser, get_authentik_client, get_db

from app.schemas.user import CurrentUserResponse



router = APIRouter(prefix="/auth", tags=["Authentication"])





# --- OIDC/SSO Endpoints ---



@router.get("/authorize")

async def get_sso_authorize_url() -> dict:

    """

    Authentik OIDC 인증을 위한 Authorize URL 생성

    프론트엔드는 이 URL로 사용자를 리디렉션해야 합니다.

    """

    params = {

        "response_type": "code",

        "client_id": settings.AUTHENTIK_CLIENT_ID,

        "redirect_uri": settings.AUTHENTIK_REDIRECT_URI,

        "scope": "openid email profile",

        "state": "random_string_for_security",  # CSRF 방어를 위해 실제로는 랜덤 문자열 사용

    }

    url = f"{settings.AUTHENTIK_AUTHORIZATION_URL}?{urlencode(params)}"

    return {"auth_url": url}





class AuthCallbackRequest(BaseModel):

    code: str

    state: str | None = None



class AuthCallbackResponse(BaseModel):

    access_token: str

    refresh_token: str

    token_type: str = "bearer"

    expires_in: int

    user: CurrentUserResponse





@router.post("/callback", response_model=AuthCallbackResponse)

async def handle_sso_callback(

    request: AuthCallbackRequest,

    db: Session = Depends(get_db),

) -> AuthCallbackResponse:

    """

    OIDC 콜백 처리. Authentik에서 받은 code로 토큰 교환 및 로그인 처리

    """

    import httpx

    from jose import jwt



    # 1. Authentik에 code를 보내서 token 받기

    token_data = {

        "grant_type": "authorization_code",

        "code": request.code,

        "redirect_uri": settings.AUTHENTIK_REDIRECT_URI,

        "client_id": settings.AUTHENTIK_CLIENT_ID,

        "client_secret": settings.AUTHENTIK_CLIENT_SECRET,

    }

    async with httpx.AsyncClient() as client:

        try:

            token_res = await client.post(settings.AUTHENTIK_TOKEN_URL, data=token_data)

            token_res.raise_for_status()

            token_json = token_res.json()

        except httpx.HTTPStatusError as e:

            raise AuthenticationError(f"Failed to get token from Authentik: {e.response.text}")



    id_token = token_json.get("id_token")

    if not id_token:

        raise AuthenticationError("ID token not found in response from Authentik")



    # 2. ID Token 디코딩하여 사용자 정보 추출

    # ⚠️ 보안 경고: 프로덕션 환경에서는 반드시 Authentik의 JWKS URI를 이용해 서명을 검증해야 합니다.

    # 이 코드는 기능 구현을 위한 임시 방편이며, 서명을 검증하지 않아 보안에 취약합니다.

    try:

        payload = jwt.decode(id_token, key=None, options={"verify_signature": False})

    except Exception as e:

        raise AuthenticationError(f"Failed to decode ID token: {e}")



    authentik_id = payload.get("sub")

    email = payload.get("email")

    username = payload.get("preferred_username") or payload.get("name")

    is_superuser = payload.get("is_superuser", False)



    if not authentik_id or not email or not username:

        raise AuthenticationError("Invalid user info in ID token")



    # 3. DB에 사용자 생성 또는 업데이트

    user = await get_or_create_user_from_authentik(

        db=db,

        authentik_id=authentik_id,

        email=email,

        username=username,

        is_admin=is_superuser,

    )



    # 4. 서비스 자체 JWT 토큰 생성

    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})

    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})



    # 5. 프론트엔드에 응답 반환

    return AuthCallbackResponse(

        access_token=access_token,

        refresh_token=refresh_token,

        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,

        user=CurrentUserResponse.from_orm(user),

    )





# --- Token and User Info Endpoints ---





class TokenRequest(BaseModel):

    """토큰 요청 스키마"""

    authentik_token: str = Field(description="Authentik 액세스 토큰")





class TokenResponse(BaseModel):

    """토큰 응답 스키마"""

    access_token: str = Field(description="JWT 액세스 토큰")

    refresh_token: str = Field(description="JWT 리프레시 토큰")

    token_type: str = Field(default="bearer", description="토큰 타입")

    expires_in: int = Field(description="만료 시간 (초)")





class RefreshTokenRequest(BaseModel):

    """리프레시 토큰 요청 스키마"""

    refresh_token: str = Field(description="JWT 리프레시 토큰")





class DevLoginRequest(BaseModel):

    """개발용 로그인 요청 스키마 (Authentik 없이 이메일로 로그인)"""

    email: str = Field(description="사용자 이메일")

    password: str = Field(default="devpassword", description="개발용 비밀번호 (기본값: devpassword)")





@router.post("/token", response_model=TokenResponse)

async def login(

    request: TokenRequest,

    db: Session = Depends(get_db),

    authentik_client: AuthentikClient = Depends(get_authentik_client),

) -> TokenResponse:

    """

    Authentik 토큰으로 로그인하여 JWT 토큰 발급



    이 엔드포인트는 Authentik에서 발급한 토큰을 검증하고,

    사용자 정보를 DB에 동기화한 후 JWT 토큰을 발급합니다.



    Args:

        request: Authentik 토큰 요청

        db: 데이터베이스 세션

        authentik_client: Authentik 클라이언트



    Returns:

        TokenResponse: JWT 액세스 토큰 및 리프레시 토큰



    Raises:

        AuthenticationError: 인증 실패



    Example:

        POST /api/v1/auth/token

        {

            "authentik_token": "eyJhbGciOiJSUzI1NiIs..."

        }

    """

    # Authentik 토큰 검증 및 사용자 정보 조회

    try:

        user_info = await authentik_client.verify_user_token(request.authentik_token)

    except Exception as e:

        raise AuthenticationError(f"Failed to verify Authentik token: {str(e)}")



    # 사용자 정보 추출

    authentik_id = user_info.get("sub")

    email = user_info.get("email")

    username = user_info.get("preferred_username") or user_info.get("name")

    is_superuser = user_info.get("is_superuser", False)



    if not authentik_id or not email or not username:

        raise AuthenticationError("Invalid user info from Authentik")



    # DB에 사용자 생성 또는 업데이트

    user = await get_or_create_user_from_authentik(

        db=db,

        authentik_id=authentik_id,

        email=email,

        username=username,

        is_admin=is_superuser,

    )



    # JWT 토큰 생성

    from app.config import settings



    access_token = create_access_token(

        data={"sub": user.email, "user_id": user.id}

    )

    refresh_token = create_refresh_token(

        data={"sub": user.email, "user_id": user.id}

    )



    return TokenResponse(

        access_token=access_token,

        refresh_token=refresh_token,

        token_type="bearer",

        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,

    )





@router.post("/refresh", response_model=TokenResponse)

async def refresh_token(

    request: RefreshTokenRequest,

    db: Session = Depends(get_db),

) -> TokenResponse:

    """

    리프레시 토큰으로 새로운 액세스 토큰 발급



    Args:

        request: 리프레시 토큰 요청

        db: 데이터베이스 세션



    Returns:

        TokenResponse: 새로운 JWT 액세스 토큰



    Raises:

        AuthenticationError: 리프레시 토큰 검증 실패



    Example:

        POST /api/v1/auth/refresh

        {

            "refresh_token": "eyJhbGciOiJIUzI1NiIs..."

        }

    """

    # 리프레시 토큰 검증

    try:

        payload = verify_token(request.refresh_token)

    except Exception:

        raise AuthenticationError("Invalid refresh token")



    # 토큰 타입 확인

    if payload.get("type") != "refresh":

        raise AuthenticationError("Invalid token type")



    user_id: int | None = payload.get("user_id")

    if user_id is None:

        raise AuthenticationError("Invalid token payload")



    # 사용자 존재 확인

    from app.models.user import User



    user = db.query(User).filter(User.id == user_id).first()

    if not user:

        raise AuthenticationError("User not found")



    if not user.is_active:

        raise AuthenticationError("User is inactive")



    # 새로운 액세스 토큰 생성

    from app.config import settings



    access_token = create_access_token(

        data={"sub": user.email, "user_id": user.id}

    )

    new_refresh_token = create_refresh_token(

        data={"sub": user.email, "user_id": user.id}

    )



    return TokenResponse(

        access_token=access_token,

        refresh_token=new_refresh_token,

        token_type="bearer",

        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,

    )





@router.post("/login", response_model=TokenResponse)
async def dev_login(
    request: DevLoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    # 1. 유저 조회 (한 번만 수행)
    user = db.query(User).filter(User.email == request.email).first()

    # 2. 유저 존재 여부 및 비밀번호 검증
    # 유저가 없거나, DB에 비밀번호가 없거나, 입력된 비밀번호가 틀린 경우 모두 차단
    if not user:
        raise AuthenticationError("등록되지 않은 사용자입니다.")

    if not user.hashed_password or not verify_password(request.password, user.hashed_password):
        raise AuthenticationError("비밀번호가 일치하지 않습니다.")

    # 3. 비활성 유저 체크 (필요 시 활성화)
    if not user.is_active:
        user.is_active = True
        db.commit()

    # 4. 토큰 발급 (app.core.security 유틸리티 사용)
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    refresh_token = create_refresh_token(data={"sub": user.email, "user_id": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )




@router.get("/verify")

async def verify_token_endpoint(

    current_user: CurrentUser,

) -> dict:

    """

    토큰 유효성 검증



    Args:

        current_user: 현재 로그인한 사용자



    Returns:

        dict: 검증 결과

    """

    return {"valid": True, "user_id": current_user.id}





@router.get("/me", response_model=CurrentUserResponse)

async def get_current_user_info(

    current_user: CurrentUser,

) -> CurrentUserResponse:

    """

    현재 로그인한 사용자 정보 조회



    Args:

        current_user: 현재 로그인한 사용자



    Returns:

        CurrentUserResponse: 사용자 정보



    Example:

        GET /api/v1/auth/me

        Headers: Authorization: Bearer {token}

    """

    return CurrentUserResponse(

        id=current_user.id,

        email=current_user.email,

        username=current_user.username,

        authentik_id=current_user.authentik_id,

        is_active=current_user.is_active,

        is_admin=current_user.is_admin,

        created_at=current_user.created_at.isoformat(),

        updated_at=current_user.updated_at.isoformat(),

    )
