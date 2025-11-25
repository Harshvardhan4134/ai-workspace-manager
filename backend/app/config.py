import os
from functools import lru_cache
from typing import Optional


class Settings:
    """Simple settings class that reads from environment variables."""
    
    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT", "ai-workspace-manager")
        self.firestore_collection_tasks = os.getenv("FIRESTORE_TASKS_COLLECTION", "tasks")
        self.firestore_collection_users = os.getenv("FIRESTORE_USERS_COLLECTION", "users")
        self.firestore_collection_messages = os.getenv("FIRESTORE_MESSAGES_COLLECTION", "messages")
        self.firestore_collection_meetings = os.getenv("FIRESTORE_MEETINGS_COLLECTION", "meetings")
        self.firestore_collection_updates = os.getenv("FIRESTORE_UPDATES_COLLECTION", "updates")
        self.gcs_bucket = os.getenv("GCS_BUCKET", "ai-workspace-manager-attachments")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        self.ai_timeout_seconds = int(os.getenv("AI_TIMEOUT_SECONDS", "30"))
        self.ai_agent_base_url = os.getenv("AI_AGENT_BASE_URL", "http://localhost:8081")


@lru_cache
def get_settings() -> Settings:
    return Settings()
