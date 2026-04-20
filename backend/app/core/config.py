from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    APP_ENV: str = "development"
    APP_NAME: str = "LHS - Lawyer Hiring System"
    APP_VERSION: str = "1.0.0"

    # PostgreSQL
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = "lhsdb"

    # JWT Security
    SECRET_KEY: str = "yoursecretkey_changeme"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # CORS — comma-separated string in .env, parsed to list
    ALLOWED_ORIGINS: str = "http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000"

    # File uploads
    UPLOAD_DIR: str = "static/uploads"
    MAX_UPLOAD_SIZE_MB: int = 5

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
