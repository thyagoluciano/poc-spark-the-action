import logging
import os

logger = logging.getLogger(__name__)

_DEFAULT_SECRET_KEY = "dev-secret-key-change-in-production"


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY") or _DEFAULT_SECRET_KEY
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kanban.db")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")


settings = Settings()

if settings.SECRET_KEY == _DEFAULT_SECRET_KEY:
    logger.warning(
        "SECRET_KEY is using the insecure default value. "
        "Set the SECRET_KEY environment variable in production."
    )
