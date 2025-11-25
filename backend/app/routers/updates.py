from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends

from app.auth import AuthUser, get_current_user
from app.models import Update, UpdateCreate

router = APIRouter(prefix="/updates", tags=["updates"])

# Lazy initialization to avoid import-time failures
_firestore_service = None

def get_firestore_service():
    global _firestore_service
    if _firestore_service is None:
        from app.services.firestore import FirestoreService
        _firestore_service = FirestoreService()
    return _firestore_service


@router.get("/", response_model=List[Update])
def list_updates(current_user: AuthUser = Depends(get_current_user), limit: int = 20):
    return get_firestore_service().list_updates(limit=limit)


@router.post("/", response_model=Update, status_code=201)
def create_update(payload: UpdateCreate, current_user: AuthUser = Depends(get_current_user)):
    firestore = get_firestore_service()
    body = payload.model_dump()
    body.update(
        {
            "user_id": current_user.uid,
            "user_name": current_user.name,
            "created_at": datetime.utcnow().isoformat(),
        }
    )
    firestore.create_update(body)
    return body

