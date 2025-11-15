"""Application configuration using Pydantic settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""

    # Application
    APP_NAME: str = "IPO Document Verification"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str
    API_V1_PREFIX: str = "/api/v1"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4

    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600

    # Redis
    REDIS_URL: str
    REDIS_MAX_CONNECTIONS: int = 50

    # Celery
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str
    CELERY_TASK_TRACK_STARTED: bool = True
    CELERY_TASK_TIME_LIMIT: int = 3600
    CELERY_TASK_SOFT_TIME_LIMIT: int = 3000

    # RabbitMQ
    RABBITMQ_HOST: str = "localhost"
    RABBITMQ_PORT: int = 5672
    RABBITMQ_USER: str = "admin"
    RABBITMQ_PASSWORD: str
    RABBITMQ_VHOST: str = "ipo_vhost"

    # Weaviate
    WEAVIATE_URL: str
    WEAVIATE_API_KEY: Optional[str] = None
    WEAVIATE_BATCH_SIZE: int = 100

    # Google Gemini
    GOOGLE_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-pro"
    GEMINI_TEMPERATURE: float = 0.1
    GEMINI_MAX_TOKENS: int = 8192

    # Mistral AI (for document extraction and citation)
    MISTRAL_API_KEY: str
    MISTRAL_MODEL: str = "mistral-large-latest"  # Best for reasoning and extraction
    MISTRAL_TEMPERATURE: float = 0.1
    MISTRAL_MAX_TOKENS: int = 8192

    # OpenAI (for embeddings)
    OPENAI_API_KEY: str
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-large"
    OPENAI_EMBEDDING_DIMENSION: int = 3072  # text-embedding-3-large default
    OPENAI_EMBEDDING_BATCH_SIZE: int = 100

    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: Optional[str] = None
    SUPABASE_STORAGE_BUCKET: str = "ipo-documents"

    # Document Processing
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 128

    # File Upload
    MAX_UPLOAD_SIZE: int = 104857600  # 100MB
    ALLOWED_EXTENSIONS: str = "pdf,docx,doc"
    USE_SUPABASE_STORAGE: bool = True  # Use Supabase Storage instead of local filesystem

    # Verification
    VERIFICATION_BATCH_SIZE: int = 10
    MIN_SIMILARITY_THRESHOLD: float = 0.7
    CONFIDENCE_THRESHOLD_HIGH: float = 0.85
    CONFIDENCE_THRESHOLD_LOW: float = 0.6

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"
    CORS_ALLOW_CREDENTIALS: bool = True

    # Monitoring
    SENTRY_DSN: Optional[str] = None
    PROMETHEUS_ENABLED: bool = True

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60

    # Caching
    CACHE_TTL: int = 3600  # 1 hour
    CACHE_ENABLED: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

    @property
    def allowed_extensions_list(self) -> list[str]:
        """Get allowed file extensions as a list."""
        return self.ALLOWED_EXTENSIONS.split(',')


settings = Settings()
