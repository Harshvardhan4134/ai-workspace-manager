from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth import AuthUser, get_current_user

router = APIRouter(prefix="/attachments", tags=["attachments"])

# Lazy initialization to avoid import-time failures
_gcs_service = None

def get_gcs_service():
    global _gcs_service
    if _gcs_service is None:
        from app.services.gcs import GCSService
        _gcs_service = GCSService()
    return _gcs_service


class SignedUrlRequest(BaseModel):
    filename: str
    content_type: str


@router.post("/signed-url")
def generate_signed_url(
    payload: SignedUrlRequest,
    current_user: AuthUser = Depends(get_current_user),
):
    return get_gcs_service().generate_signed_upload_url(payload.filename, payload.content_type)


