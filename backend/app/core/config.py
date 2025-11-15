"""
Application configuration
"""

from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ipo_verification"

    # Security
    SECRET_KEY: str = "change-this-in-production"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # API Keys
    OPENAI_API_KEY: str = ""
    MISTRAL_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "ipo-documents"
    USE_SUPABASE_STORAGE: bool = False

    # Weaviate
    WEAVIATE_URL: str = "http://localhost:8080"
    WEAVIATE_API_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # RabbitMQ
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"

    # OpenAI
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-large"
    OPENAI_EMBEDDING_DIMENSION: int = 3072

    # Mistral
    MISTRAL_MODEL: str = "mistral-large-latest"
    MISTRAL_TEMPERATURE: float = 0.1
    MISTRAL_MAX_TOKENS: int = 8192

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
