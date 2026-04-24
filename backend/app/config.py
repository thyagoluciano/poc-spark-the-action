import logging

from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

_DEFAULT_SECRET_KEY = "dev-secret-key-change-in-production"

JWT_ALGORITHM = "HS256"


class Settings(BaseSettings):
    SECRET_KEY: str = _DEFAULT_SECRET_KEY
    DATABASE_URL: str = "sqlite:///./kanban.db"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = {"env_file": ".env"}


settings = Settings()

if settings.SECRET_KEY == _DEFAULT_SECRET_KEY:
    logger.warning(
        "SECRET_KEY is using the insecure default value. "
        "Set the SECRET_KEY environment variable in production."
    )
