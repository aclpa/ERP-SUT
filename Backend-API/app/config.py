from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    애플리케이션 설정
    환경변수 또는 .env 파일에서 값을 읽어옵니다.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

    API_V1_STR: str = "/api/v1"
    FRONTEND_URL: str = "http://localhost:9000"

    # Database
    DATABASE_URL: str

    # Authentik SSO (OIDC)
    AUTHENTIK_URL: str
    AUTHENTIK_CLIENT_ID: str = ""
    AUTHENTIK_CLIENT_SECRET: str = ""
    AUTHENTIK_AUTHORIZATION_URL_PATH: str = "/application/o/authorize/"
    AUTHENTIK_TOKEN_URL_PATH: str = "/application/o/token/"
    AUTHENTIK_USERINFO_URL_PATH: str = "/application/o/userinfo/"
    AUTHENTIK_REDIRECT_PATH: str = "/auth/callback"

    @property
    def AUTHENTIK_AUTHORIZATION_URL(self) -> str:
        """Full Authentik authorization URL"""
        return f"{self.AUTHENTIK_URL.rstrip('/')}{self.AUTHENTIK_AUTHORIZATION_URL_PATH}"

    @property
    def AUTHENTIK_TOKEN_URL(self) -> str:
        """Full Authentik token endpoint URL"""
        return f"{self.AUTHENTIK_URL.rstrip('/')}{self.AUTHENTIK_TOKEN_URL_PATH}"

    @property
    def AUTHENTIK_USERINFO_URL(self) -> str:
        """Full Authentik userinfo endpoint URL"""
        return f"{self.AUTHENTIK_URL.rstrip('/')}{self.AUTHENTIK_USERINFO_URL_PATH}"

    @property
    def AUTHENTIK_REDIRECT_URI(self) -> str:
        """Full frontend redirect URI for Authentik"""
        return f"{self.FRONTEND_URL.rstrip('/')}{self.AUTHENTIK_REDIRECT_PATH}"

    # Authentik (Legacy - for service-to-service, if needed)
    AUTHENTIK_TOKEN: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Application
    APP_NAME: str = "DevFlow ERP"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    LOG_LEVEL: str = "INFO"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    @property
    def cors_origins_list(self) -> List[str]:
        """CORS origins를 리스트로 반환"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# 전역 설정 인스턴스
settings = Settings()
