from datetime import datetime, date
from typing import List, Optional, Literal, Dict

from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    tags: List[str] = []
    attachments: List[str] = []
    complexity: Literal["low", "medium", "high"]
    priority: Optional[int] = Field(None, ge=1, le=5)
    deadline: Optional[date]
    flowchart_step: Optional[str]
    customer_name: Optional[str] = ""
    project_name: Optional[str] = ""
    prd_url: Optional[str] = ""


class Task(TaskBase):
    id: Optional[str]
    predicted_hours: Optional[float]
    assigned_to: Optional[str]
    created_by: Optional[str]
    status: Literal["open", "in_progress", "in_review", "blocked", "completed"] = "open"
    watchers: List[str] = []
    activity_log: List[Dict[str, str]] = []
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    tags: Optional[List[str]]
    attachments: Optional[List[str]]
    complexity: Optional[Literal["low", "medium", "high"]]
    priority: Optional[int] = Field(None, ge=1, le=5)
    deadline: Optional[date]
    status: Optional[Literal["open", "in_progress", "in_review", "blocked", "completed"]]
    assigned_to: Optional[str]
    flowchart_step: Optional[str]
    watchers: Optional[List[str]]


class Message(BaseModel):
    id: Optional[str]
    task_id: str
    sender_id: str
    text: str
    attachments: List[str] = []
    created_at: Optional[datetime]


class MessageCreate(BaseModel):
    task_id: str
    text: str
    attachments: List[str] = []


class UserProfile(BaseModel):
    id: str
    name: str
    role: Optional[str]
    skills: List[str] = []
    capacity_hours: float = 40.0
    assigned_hours: float = 0.0
    availability: Optional[str]
    email: Optional[str]
    avatar_url: Optional[str]
    resume_url: Optional[str]
    phone: Optional[str]
    bio: Optional[str]
    status: Literal["active", "busy", "on_leave"] = "active"


class UserUpdate(BaseModel):
    name: Optional[str]
    role: Optional[str]
    skills: Optional[List[str]]
    capacity_hours: Optional[float]
    assigned_hours: Optional[float]
    availability: Optional[str]
    email: Optional[str]
    avatar_url: Optional[str]
    resume_url: Optional[str]
    phone: Optional[str]
    bio: Optional[str]
    status: Optional[Literal["active", "busy", "on_leave"]]


class Meeting(BaseModel):
    id: Optional[str]
    title: str
    description: Optional[str] = ""
    attendees: List[str]
    date: datetime
    duration_minutes: int
    task_id: Optional[str]
    created_by: str
    meet_url: Optional[str]


class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    attendees: List[str]
    date: datetime
    duration_minutes: int = 30
    task_id: Optional[str]
    meet_url: Optional[str]


class MeetingSuggestion(BaseModel):
    attendees: List[str]
    duration: int
    day: date


class AIAssignmentResult(BaseModel):
    predicted_hours: Optional[float]
    best_member_id: Optional[str]
    priority: Optional[int]
    deadline: Optional[date]
    flowchart_next_step: Optional[str]
    required_meeting: Optional[bool]
    meeting_suggestion: Optional[MeetingSuggestion]
    reason: Optional[str]


class Update(BaseModel):
    id: Optional[str]
    user_id: str
    user_name: Optional[str]
    priority: Literal["low", "medium", "high"]
    message: str
    task_id: Optional[str]
    created_at: Optional[datetime]


class UpdateCreate(BaseModel):
    priority: Literal["low", "medium", "high"]
    message: str
    task_id: Optional[str]
