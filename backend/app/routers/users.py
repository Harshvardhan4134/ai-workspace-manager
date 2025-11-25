from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from app.auth import AuthUser, get_current_user
from app.models import UserProfile, UserUpdate
from app.services.firestore import FirestoreService

router = APIRouter(prefix="/users", tags=["users"])
firestore_service = FirestoreService()


class InviteUserRequest(BaseModel):
    email: EmailStr
    role: str = "employee"
    name: str = ""


def ensure_user_defaults(user: dict) -> dict:
    """Ensure all required fields have defaults."""
    user.setdefault("phone", "")
    user.setdefault("bio", "")
    user.setdefault("avatar_url", None)
    user.setdefault("resume_url", None)
    user.setdefault("availability", "")
    user.setdefault("skills", [])
    user.setdefault("capacity_hours", 40)
    user.setdefault("assigned_hours", 0)
    user.setdefault("status", "active")
    user.setdefault("role", "employee")
    return user


@router.get("/", response_model=List[UserProfile])
def list_users(current_user: AuthUser = Depends(get_current_user)):
    users = firestore_service.list_users()
    return [ensure_user_defaults(u) for u in users]


@router.get("/me", response_model=UserProfile)
def get_me(current_user: AuthUser = Depends(get_current_user)):
    profile = firestore_service.get_user(current_user.uid)
    if not profile:
        profile = {
            "id": current_user.uid,
            "name": current_user.name or "New teammate",
            "email": current_user.email,
            "role": "employee",
            "skills": [],
            "capacity_hours": 40,
            "assigned_hours": 0,
            "status": "active",
            "phone": "",
            "bio": "",
            "avatar_url": None,
            "resume_url": None,
            "availability": "",
        }
        try:
            firestore_service.upsert_user(current_user.uid, profile)
        except ValueError:
            # Firestore not available yet - return default profile anyway
            pass
    else:
        profile = ensure_user_defaults(profile)
    return profile


@router.patch("/me", response_model=UserProfile)
def update_me(update: UserUpdate, current_user: AuthUser = Depends(get_current_user)):
    payload = update.model_dump(exclude_unset=True)
    try:
        firestore_service.upsert_user(current_user.uid, payload)
        result = firestore_service.get_user(current_user.uid)
        if not result:
            # If we can't get the user after update, return the payload we just saved
            result = {
                "id": current_user.uid,
                "name": current_user.name or "New teammate",
                "email": current_user.email,
                **payload,
            }
        return ensure_user_defaults(result)
    except ValueError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Firestore database not available. Please create the database in Google Cloud Console. Error: {str(e)}"
        )


@router.post("/invite", response_model=dict)
def invite_user(
    invite: InviteUserRequest,
    current_user: AuthUser = Depends(get_current_user),
):
    """Invite a new user to the workspace. Creates a placeholder profile."""
    requester = firestore_service.get_user(current_user.uid)
    if requester and requester.get("role") not in {"admin", "manager"}:
        raise HTTPException(status_code=403, detail="Only admins and managers can invite users")
    try:
        # Generate a placeholder ID from email (in production, use Firebase Auth to create user)
        user_id = invite.email.replace("@", "_at_").replace(".", "_")
        name = invite.name or invite.email.split("@")[0]
        profile = {
            "id": user_id,
            "email": invite.email,
            "name": name,
            "role": invite.role,
            "skills": [],
            "capacity_hours": 40.0,
            "assigned_hours": 0.0,
            "status": "active",
            "phone": "",
            "bio": "",
            "avatar_url": None,
            "resume_url": None,
            "availability": "",
        }
        firestore_service.upsert_user(user_id, profile)
        return {"success": True, "message": f"Invitation sent to {invite.email}", "user_id": user_id}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.patch("/{user_id}", response_model=UserProfile)
def update_user(
    user_id: str,
    update: UserUpdate,
    current_user: AuthUser = Depends(get_current_user),
):
    requester = firestore_service.get_user(current_user.uid)
    if requester and requester.get("role") not in {"admin", "manager", "Founder"}:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    try:
        firestore_service.upsert_user(user_id, update.model_dump(exclude_unset=True))
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    result = firestore_service.get_user(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found after update")
    return ensure_user_defaults(result)


