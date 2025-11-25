from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends

from app.auth import AuthUser, get_current_user
from app.models import Message, MessageCreate
from app.services.firestore import FirestoreService
from app.services.ai_agent import AIAgentService

router = APIRouter(prefix="/messages", tags=["messages"])
firestore_service = FirestoreService()
ai_service = AIAgentService()


@router.get("/{task_id}", response_model=List[Message])
def list_messages(task_id: str, current_user: AuthUser = Depends(get_current_user)):
    return firestore_service.list_messages(task_id)


@router.post("/", response_model=Message, status_code=201)
async def create_message(
    message: MessageCreate,
    current_user: AuthUser = Depends(get_current_user),
):
    payload = message.model_dump(exclude_unset=True)
    payload.update({"created_at": datetime.utcnow().isoformat(), "sender_id": current_user.uid})
    firestore_service.create_message(payload)
    task = firestore_service.get_task(message.task_id)
    activity_log = task.get("activity_log", [])
    activity_log.append(
        {
            "timestamp": payload["created_at"],
            "actor": current_user.uid,
            "action": "Commented on task",
        }
    )
    firestore_service.update_task(
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
    messages = firestore_service.list_messages(task_id)
    return await ai_service.summarize_chat(messages)


