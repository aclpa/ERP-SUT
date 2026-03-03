"""
FastAPI application entry point
DevFlow ERP 백엔드
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.v1 import (
    auth,
    dashboard,
    deployments,
    issues,
    members,
    projects,
    servers,
    services,
    sprints,
    teams,
    users,
)
from app.config import settings
from app.core.logging import setup_logging, get_logger

setup_logging()
logger = get_logger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## DevFlow ERP

이메일/비밀번호 기반 JWT 인증을 사용합니다.

### 인증 방법
1. `POST /api/v1/auth/login` 으로 토큰 발급
2. 이후 요청에 `Authorization: Bearer <access_token>` 헤더 포함
    """,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    openapi_tags=[
        {"name": "Health", "description": "헬스 체크"},
        {"name": "Authentication", "description": "로그인 / 토큰 관리"},
        {"name": "Users", "description": "사용자 관리"},
        {"name": "Dashboard", "description": "대시보드"},
        {"name": "Projects", "description": "프로젝트"},
        {"name": "Sprints", "description": "스프린트"},
        {"name": "Issues", "description": "이슈"},
        {"name": "Teams", "description": "팀"},
        {"name": "Members", "description": "멤버"},
        {"name": "Servers", "description": "서버"},
        {"name": "Services", "description": "서비스"},
        {"name": "Deployments", "description": "배포"},
    ],
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Request validation failed", "errors": errors},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled exception on {request.method} {request.url.path}",
        exception_type=type(exc).__name__,
        exception=str(exc),
        exc_info=True,
    )
    detail = "An internal server error occurred" if settings.ENVIRONMENT == "production" \
        else f"{type(exc).__name__}: {str(exc)}"
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": detail, "type": "internal_error"},
    )


# Lifecycle
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"Shutting down {settings.APP_NAME}")


# Health
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/ready", tags=["Health"])
async def readiness_check():
    return {"status": "ready"}


# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(teams.router, prefix="/api/v1")
app.include_router(members.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(sprints.router, prefix="/api/v1")
app.include_router(issues.router, prefix="/api/v1")
app.include_router(servers.router, prefix="/api/v1")
app.include_router(services.router, prefix="/api/v1")
app.include_router(deployments.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)