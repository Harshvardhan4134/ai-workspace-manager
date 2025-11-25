from typing import List, Dict, Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth import AuthUser, get_current_user

router = APIRouter(prefix="/agent", tags=["agent"])

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


class WorkloadRequest(BaseModel):
    workloads: List[Dict[str, Any]]


class MeetingSuggestionRequest(BaseModel):
    context: Dict[str, Any]


class FlowchartRequest(BaseModel):
    task: Dict[str, Any]


@router.get("/who-is-overloaded")
async def who_is_overloaded(current_user: AuthUser = Depends(get_current_user)):
    users = get_firestore_service().list_users()
    workloads = [
        {
            "id": user["id"],
            "name": user.get("name"),
            "utilization": user.get("assigned_hours", 0) / max(user.get("capacity_hours", 40), 1),
            "skills": user.get("skills"),
        }
        for user in users
    ]
    return await get_ai_service().overload_report(workloads)


@router.post("/workload")
async def workload_report(payload: WorkloadRequest, current_user: AuthUser = Depends(get_current_user)):
    return await get_ai_service().overload_report(payload.workloads)


@router.post("/meeting-suggestion")
async def meeting_suggestion(
    payload: MeetingSuggestionRequest,
    current_user: AuthUser = Depends(get_current_user),
):
    return await get_ai_service().suggest_meeting(payload.context)


@router.post("/flowchart")
async def flowchart_prediction(
    payload: FlowchartRequest,
    current_user: AuthUser = Depends(get_current_user),
):
    return await get_ai_service().flowchart_prediction(payload.task)


