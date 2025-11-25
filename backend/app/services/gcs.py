from __future__ import annotations

from datetime import timedelta
from typing import Dict

from google.cloud import storage

from app.config import get_settings


class GCSService:
    def __init__(self) -> None:
        settings = get_settings()
        self._bucket_name = settings.gcs_bucket
        self._client = storage.Client(project=settings.project_id)

    def generate_signed_upload_url(self, blob_name: str, content_type: str) -> Dict[str, str]:
        bucket = self._client.bucket(self._bucket_name)
        blob = bucket.blob(blob_name)
        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=10),
            method="PUT",
            content_type=content_type,
        )
        return {"upload_url": url, "public_url": blob.public_url}


