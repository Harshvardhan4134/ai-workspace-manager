from __future__ import annotations

from typing import Any, Dict, List, Optional

from google.cloud import firestore
from google.api_core import exceptions as gcp_exceptions

from app.config import get_settings


class FirestoreService:
    """Lightweight wrapper around Firestore collections."""

    def __init__(self) -> None:
        settings = get_settings()
        self._client = firestore.Client(project=settings.project_id)
        self._tasks_col = settings.firestore_collection_tasks
        self._users_col = settings.firestore_collection_users
        self._messages_col = settings.firestore_collection_messages
        self._meetings_col = settings.firestore_collection_meetings
        self._updates_col = settings.firestore_collection_updates

    def _collection(self, name: str):
        return self._client.collection(name)

    # Tasks
    def create_task(self, payload: Dict[str, Any]) -> str:
        doc_ref = self._collection(self._tasks_col).document()
        payload["id"] = doc_ref.id
        doc_ref.set(payload)
        return doc_ref.id

    def list_tasks(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        try:
            query = self._collection(self._tasks_col)
            if filters:
                for field, value in filters.items():
                    query = query.where(field, "==", value)
            snapshot = query.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
            return [doc.to_dict() for doc in snapshot]
        except (gcp_exceptions.NotFound, gcp_exceptions.PermissionDenied):
            return []

    def get_task(self, task_id: str) -> Dict[str, Any]:
        doc = self._collection(self._tasks_col).document(task_id).get()
        if not doc.exists:
            raise KeyError(f"Task {task_id} not found")
        return doc.to_dict()

    def update_task(self, task_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        doc_ref = self._collection(self._tasks_col).document(task_id)
        doc_ref.set(payload, merge=True)
        return doc_ref.get().to_dict()

    # Messages
    def create_message(self, payload: Dict[str, Any]) -> str:
        doc_ref = self._collection(self._messages_col).document()
        payload["id"] = doc_ref.id
        doc_ref.set(payload)
        return doc_ref.id

    def list_messages(self, task_id: str) -> List[Dict[str, Any]]:
        try:
            snapshot = (
                self._collection(self._messages_col)
                .where("task_id", "==", task_id)
                .order_by("created_at", direction=firestore.Query.ASCENDING)
                .stream()
            )
            return [doc.to_dict() for doc in snapshot]
        except (gcp_exceptions.NotFound, gcp_exceptions.PermissionDenied):
            return []

    # Users
    def list_users(self) -> List[Dict[str, Any]]:
        try:
            snapshot = self._collection(self._users_col).stream()
            return [doc.to_dict() for doc in snapshot]
        except (gcp_exceptions.NotFound, gcp_exceptions.PermissionDenied):
            return []

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            doc = self._collection(self._users_col).document(user_id).get()
            return doc.to_dict() if doc.exists else None
        except (gcp_exceptions.NotFound, gcp_exceptions.PermissionDenied):
            # Database doesn't exist yet or permission issue - return None
            return None

    def upsert_user(self, user_id: str, payload: Dict[str, Any]) -> None:
        try:
            self._collection(self._users_col).document(user_id).set(payload, merge=True)
        except (gcp_exceptions.NotFound, gcp_exceptions.PermissionDenied) as e:
            # Database doesn't exist yet - log but don't crash
            # User will need to create Firestore database first
            raise ValueError(f"Firestore database not available: {e}") from e

    # Meetings
    def create_meeting(self, payload: Dict[str, Any]) -> str:
        doc_ref = self._collection(self._meetings_col).document()
        payload["id"] = doc_ref.id
        doc_ref.set(payload)
        return doc_ref.id

    def list_meetings(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        try:
            query = self._collection(self._meetings_col)
            if filters:
                for key, value in filters.items():
                    query = query.where(key, "==", value)
            snapshot = query.order_by("date", direction=firestore.Query.ASCENDING).stream()
            return [doc.to_dict() for doc in snapshot]
        except (gcp_exceptions.NotFound, gcp_exceptions.PermissionDenied):
            return []

    def get_meeting(self, meeting_id: str) -> Dict[str, Any]:
        doc = self._collection(self._meetings_col).document(meeting_id).get()
        if not doc.exists:
            raise KeyError(f"Meeting {meeting_id} not found")
        return doc.to_dict()

    # Updates
    def create_update(self, payload: Dict[str, Any]) -> str:
        doc_ref = self._collection(self._updates_col).document()
        payload["id"] = doc_ref.id
        doc_ref.set(payload)
        return doc_ref.id

    def list_updates(self, limit: int = 20) -> List[Dict[str, Any]]:
        try:
            snapshot = (
                self._collection(self._updates_col)
                .order_by("created_at", direction=firestore.Query.DESCENDING)
                .limit(limit)
                .stream()
            )
            return [doc.to_dict() for doc in snapshot]
        except (gcp_exceptions.NotFound, gcp_exceptions.PermissionDenied):
            return []


