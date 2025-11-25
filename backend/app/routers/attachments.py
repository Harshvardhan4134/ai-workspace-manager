from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth import AuthUser, get_current_user
from app.services.gcs import GCSService

router = APIRouter(prefix="/attachments", tags=["attachments"])
gcs_service = GCSService()


class SignedUrlRequest(BaseModel):
    filename: str
    content_type: str


@router.post("/signed-url")
def generate_signed_url(
    payload: SignedUrlRequest,
    current_user: AuthUser = Depends(get_current_user),
):
    return gcs_service.generate_signed_upload_url(payload.filename, payload.content_type)


