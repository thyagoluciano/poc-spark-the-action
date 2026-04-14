import os


class Settings:
    SECRET_KEY: str = os.environ["SECRET_KEY"]
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kanban.db")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )


settings = Settings()
