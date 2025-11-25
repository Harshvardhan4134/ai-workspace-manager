from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends

from app.auth import AuthUser, get_current_user
from app.models import Task, TaskCreate, TaskUpdate
from app.services.firestore import FirestoreService
from app.services.ai_agent import AIAgentService

router = APIRouter(prefix="/tasks", tags=["tasks"])
firestore_service = FirestoreService()
ai_service = AIAgentService()


@router.get("/", response_model=List[Task])
def list_tasks(
    status: Optional[str] = None,
    priority: Optional[int] = None,
    current_user: AuthUser = Depends(get_current_user),
):
    filters = {}
    if status:
        filters["status"] = status
    if priority:
        filters["priority"] = priority
    return firestore_service.list_tasks(filters if filters else None)


@router.post("/", response_model=Task, status_code=201)
async def create_task(task: TaskCreate, current_user: AuthUser = Depends(get_current_user)):
    now = datetime.utcnow().isoformat()
    payload = task.model_dump(exclude_unset=True)
    payload.update(
        {
            "created_at": now,
            "updated_at": now,
            "created_by": current_user.uid,
            "status": "open",
            "watchers": [current_user.uid],
            "activity_log": [
                {
                    "timestamp": now,
                    "actor": current_user.uid,
                    "action": "Task created",
                }
            ],
        }
    )
    team = firestore_service.list_users()
    try:
        ai_prediction = await ai_service.predict_assignment(payload, team)
        payload.update(
            {
                "predicted_hours": ai_prediction.predicted_hours,
                "assigned_to": ai_prediction.best_member_id,
                "priority": ai_prediction.priority or payload.get("priority"),
                "deadline": ai_prediction.deadline or payload.get("deadline"),
                "flowchart_step": ai_prediction.flowchart_next_step or payload.get("flowchart_step"),
                "ai_reason": ai_prediction.reason,
            }
        )
        if ai_prediction.required_meeting and ai_prediction.meeting_suggestion:
            payload["meeting_suggestion"] = ai_prediction.meeting_suggestion.model_dump()
    except ValueError as e:
        # AI agent not available - continue without AI predictions
        payload["ai_reason"] = f"AI unavailable: {str(e)}"
    firestore_service.create_task(payload)
    return payload


@router.get("/{task_id}", response_model=Task)
def get_task(task_id: str, current_user: AuthUser = Depends(get_current_user)):
    try:
        return firestore_service.get_task(task_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/{task_id}", response_model=Task)
def update_task(task_id: str, task: TaskUpdate, current_user: AuthUser = Depends(get_current_user)):
    existing = firestore_service.get_task(task_id)
    payload = task.model_dump(exclude_unset=True)
    now = datetime.utcnow().isoformat()
    payload["updated_at"] = now
    activity_log = existing.get("activity_log", [])
    activity_log.append({"timestamp": now, "actor": current_user.uid, "action": "Task updated"})
    payload["activity_log"] = activity_log
    if "watchers" in payload:
        payload["watchers"] = list({*payload["watchers"], current_user.uid})
    try:
        return firestore_service.update_task(task_id, payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{task_id}/auto-assign", response_model=Task)
async def auto_assign(task_id: str, current_user: AuthUser = Depends(get_current_user)):
    task = firestore_service.get_task(task_id)
    team = firestore_service.list_users()
    try:
        ai_prediction = await ai_service.predict_assignment(task, team)
        update_payload = {
            "assigned_to": ai_prediction.best_member_id,
            "predicted_hours": ai_prediction.predicted_hours,
            "priority": ai_prediction.priority or task.get("priority"),
            "deadline": ai_prediction.deadline or task.get("deadline"),
            "flowchart_step": ai_prediction.flowchart_next_step or task.get("flowchart_step"),
            "ai_reason": ai_prediction.reason,
            "updated_at": datetime.utcnow().isoformat(),
        }
        if ai_prediction.required_meeting and ai_prediction.meeting_suggestion:
            update_payload["meeting_suggestion"] = ai_prediction.meeting_suggestion.model_dump()
    except ValueError as e:
        raise HTTPException(status_code=503, detail=f"AI agent not available: {str(e)}")
    activity_log = task.get("activity_log", [])
    activity_log.append({"timestamp": update_payload["updated_at"], "actor": current_user.uid, "action": "Auto-assigned"})
    update_payload["activity_log"] = activity_log
    updated = firestore_service.update_task(task_id, update_payload)
    return updated


