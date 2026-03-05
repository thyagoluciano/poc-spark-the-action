import os
import secrets

_MIN_SECRET_KEY_LENGTH = 32


def _get_int(env_var: str, default: int) -> int:
    value = os.getenv(env_var)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        raise ValueError(f"Env var {env_var} must be an integer, got: {value!r}")


def _get_secret_key() -> str:
    value = os.getenv("SECRET_KEY")
    if not value:
        return secrets.token_hex(32)
    if len(value) < _MIN_SECRET_KEY_LENGTH:
        raise ValueError(
            f"SECRET_KEY must be at least {_MIN_SECRET_KEY_LENGTH} characters long"
        )
    return value


class Settings:
    SECRET_KEY: str = _get_secret_key()
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kanban.db")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = _get_int("ACCESS_TOKEN_EXPIRE_MINUTES", 1440)
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")


settings = Settings()
