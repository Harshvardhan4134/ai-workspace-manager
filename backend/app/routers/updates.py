from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends

from app.auth import AuthUser, get_current_user
from app.models import Update, UpdateCreate
from app.services.firestore import FirestoreService

router = APIRouter(prefix="/updates", tags=["updates"])
firestore_service = FirestoreService()


@router.get("/", response_model=List[Update])
def list_updates(current_user: AuthUser = Depends(get_current_user), limit: int = 20):
    return firestore_service.list_updates(limit=limit)


@router.post("/", response_model=Update, status_code=201)
def create_update(payload: UpdateCreate, current_user: AuthUser = Depends(get_current_user)):
    body = payload.model_dump()
    body.update(
        {
            "user_id": current_user.uid,
            "user_name": current_user.name,
            "created_at": datetime.utcnow().isoformat(),
        }
    )
    firestore_service.create_update(body)
    return body

