"""
Application configuration loaded from environment variables.

Uses pydantic-settings BaseSettings for type-safe config with .env file support.
Mock flags allow the app to run without external API keys during development.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for Maali Mentor backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Server ───────────────────────────────────────────────
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development"

    # ── Database ─────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./maali_mentor.db"

    # ── Gemini ───────────────────────────────────────────────
    GEMINI_API_KEY: str = "your-gemini-api-key-here"
    GEMINI_MODEL_NAME: str = "gemini-3.1-flash-lite"

    # ── OpenAI (Deprecated/Optional) ─────────────────────────
    OPENAI_API_KEY: str = "your-openai-api-key-here"

    # ── Mock flags (for hackathon / offline dev) ─────────────
    USE_MOCK_SPEECH: bool = True
    USE_MOCK_LLM: bool = True


# Singleton — import this everywhere
settings = Settings()
