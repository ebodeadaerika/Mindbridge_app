"""
MindBridge — Application Configuration
Loads all environment variables with validation via Pydantic Settings.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MindBridge"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    # JWT Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440   # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30       # 30 days

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""

    # AI Companion (Groq by default — free tier, no card required)
    AI_API_KEY: str = ""
    AI_MODEL: str = "llama-3.3-70b-versatile"
    AI_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"

    # Email / SMTP (leave SMTP_HOST empty to use dev console-log fallback)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@mindbridge.app"
    SMTP_USE_TLS: bool = True
    FRONTEND_URL: str = "http://localhost:5173"

    # CORS — include all common Vite dev-server ports (5173 default, 5174/5175 when port conflicts occur)
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance — called once, reused everywhere."""
    return Settings()


settings = get_settings()
