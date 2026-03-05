import os
import secrets


def _get_int(env_var: str, default: int) -> int:
    value = os.getenv(env_var)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        raise ValueError(f"Env var {env_var} must be an integer, got: {value!r}")


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY") or secrets.token_hex(32)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kanban.db")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = _get_int("ACCESS_TOKEN_EXPIRE_MINUTES", 1440)
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")


settings = Settings()
