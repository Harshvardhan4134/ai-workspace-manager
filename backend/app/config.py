from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    project_id: str = Field(default="ai-workspace-manager", alias="GCP_PROJECT")
    firestore_collection_tasks: str = Field(default="tasks", alias="FIRESTORE_TASKS_COLLECTION")
    firestore_collection_users: str = Field(default="users", alias="FIRESTORE_USERS_COLLECTION")
    firestore_collection_messages: str = Field(default="messages", alias="FIRESTORE_MESSAGES_COLLECTION")
    firestore_collection_meetings: str = Field(default="meetings", alias="FIRESTORE_MEETINGS_COLLECTION")
    firestore_collection_updates: str = Field(default="updates", alias="FIRESTORE_UPDATES_COLLECTION")
    gcs_bucket: str = Field(default="ai-workspace-manager-attachments", alias="GCS_BUCKET")
    gemini_model: str = Field(default="gemini-2.0-flash", alias="GEMINI_MODEL")
    ai_timeout_seconds: int = Field(default=30, alias="AI_TIMEOUT_SECONDS")
    ai_agent_base_url: str = Field(default="http://localhost:8081", alias="AI_AGENT_BASE_URL")


@lru_cache
def get_settings() -> Settings:
    return Settings()


