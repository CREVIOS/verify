"""
Application configuration with GPT-4 and Gemini 2.5 Pro
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
    OPENAI_API_KEY: str = ""  # For GPT-4 and embeddings
    GEMINI_API_KEY: str = ""  # For Gemini 2.5 Pro
    GOOGLE_API_KEY: str = ""  # Alternative for Gemini

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

    # OpenAI Configuration (GPT-4.1 + Embeddings)
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-large"
    OPENAI_EMBEDDING_DIMENSION: int = 3072
    OPENAI_CHAT_MODEL: str = "gpt-4.1"  # GPT-4.1 (2025) - 1M token context, superior coding/reasoning
    OPENAI_TEMPERATURE: float = 0.1
    OPENAI_MAX_TOKENS: int = 4096

    # Gemini Configuration (Gemini 2.5 Pro)
    GEMINI_MODEL: str = "gemini-2.5-pro"  # Gemini 2.5 Pro (2025) - Google's most intelligent model
    GEMINI_TEMPERATURE: float = 0.1
    GEMINI_MAX_TOKENS: int = 4096

    # LangChain Settings
    LANGCHAIN_TRACING_V2: bool = False
    LANGCHAIN_API_KEY: str = ""

    # Verification Settings
    USE_CROSS_VALIDATION: bool = True  # Cross-validate GPT-4 with Gemini
    CONFIDENCE_THRESHOLD_VALIDATED: float = 0.8
    CONFIDENCE_THRESHOLD_UNCERTAIN: float = 0.6

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
