from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response

from app.auth import AuthUser, get_current_user
from app.models import Meeting, MeetingCreate

router = APIRouter(prefix="/meetings", tags=["meetings"])

# Lazy initialization to avoid import-time failures
_firestore_service = None

def get_firestore_service():
    global _firestore_service
    if _firestore_service is None:
        from app.services.firestore import FirestoreService
        _firestore_service = FirestoreService()
    return _firestore_service


@router.get("/", response_model=List[Meeting])
def list_meetings(
    task_id: Optional[str] = None,
    current_user: AuthUser = Depends(get_current_user),
):
    filters = {"task_id": task_id} if task_id else None
    return get_firestore_service().list_meetings(filters)


@router.post("/", response_model=Meeting, status_code=201)
def create_meeting(meeting: MeetingCreate, current_user: AuthUser = Depends(get_current_user)):
    payload = meeting.model_dump(exclude_unset=True)
    payload["created_by"] = current_user.uid
    payload["created_at"] = datetime.utcnow().isoformat()
    get_firestore_service().create_meeting(payload)
    return payload


@router.get("/{meeting_id}/ics", response_class=Response, responses={200: {"content": {"text/calendar": {}}}})
def meeting_ics(meeting_id: str, current_user: AuthUser = Depends(get_current_user)):
    try:
        meeting = get_firestore_service().get_meeting(meeting_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    ics = _build_ics(meeting)
    return Response(content=ics, media_type="text/calendar")


def _build_ics(meeting: dict) -> str:
    dt = datetime.fromisoformat(meeting["date"])
    duration = meeting.get("duration_minutes", 30)
    dt_end = dt + timedelta(minutes=duration)
    dt_stamp = dt.strftime("%Y%m%dT%H%M%SZ")
    uid = meeting.get("id", f"meeting-{dt_stamp}")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//AI Workspace Manager//EN",
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{dt_stamp}",
        f"DTSTART:{dt_stamp}",
        f"DTEND:{dt_end.strftime('%Y%m%dT%H%M%SZ')}",
        f"SUMMARY:{meeting.get('title')}",
        f"DESCRIPTION:{meeting.get('description','')}",
        f"ATTENDEE:{','.join(meeting.get('attendees', []))}",
        f"URL:{meeting.get('meet_url','')}",
        "END:VEVENT",
        "END:VCALENDAR",
    ]
    return "\r\n".join(lines)

