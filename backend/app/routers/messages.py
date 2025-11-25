from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends

from app.auth import AuthUser, get_current_user
from app.models import Message, MessageCreate

router = APIRouter(prefix="/messages", tags=["messages"])

# Lazy initialization to avoid import-time failures
_firestore_service = None
_ai_service = None

def get_firestore_service():
    global _firestore_service
    if _firestore_service is None:
        from app.services.firestore import FirestoreService
        _firestore_service = FirestoreService()
    return _firestore_service

def get_ai_service():
    global _ai_service
    if _ai_service is None:
        from app.services.ai_agent import AIAgentService
        _ai_service = AIAgentService()
    return _ai_service


@router.get("/{task_id}", response_model=List[Message])
def list_messages(task_id: str, current_user: AuthUser = Depends(get_current_user)):
    return get_firestore_service().list_messages(task_id)


@router.post("/", response_model=Message, status_code=201)
async def create_message(
    message: MessageCreate,
    current_user: AuthUser = Depends(get_current_user),
):
    firestore = get_firestore_service()
    payload = message.model_dump(exclude_unset=True)
    payload.update({"created_at": datetime.utcnow().isoformat(), "sender_id": current_user.uid})
    firestore.create_message(payload)
    task = firestore.get_task(message.task_id)
    activity_log = task.get("activity_log", [])
    activity_log.append(
        {
            "timestamp": payload["created_at"],
            "actor": current_user.uid,
            "action": "Commented on task",
        }
    )
    firestore.update_task(
        message.task_id,
        {
            "activity_log": activity_log,
            "updated_at": payload["created_at"],
            "watchers": list({*task.get("watchers", []), current_user.uid}),
        },
    )
    return payload


@router.post("/{task_id}/summarize")
async def summarize(task_id: str, current_user: AuthUser = Depends(get_current_user)):
    messages = get_firestore_service().list_messages(task_id)
    return await get_ai_service().summarize_chat(messages)


