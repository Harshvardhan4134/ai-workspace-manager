import os
from functools import lru_cache
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

security = HTTPBearer(auto_error=False)


class AuthUser(BaseModel):
    uid: str
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    role: Optional[str] = None


# Lazy initialization of Firebase Admin
_firebase_initialized = False

def _init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return True
    try:
        import firebase_admin
        from firebase_admin import credentials
        
        if not firebase_admin._apps:
            # Try default credentials (works in Cloud Run)
            firebase_admin.initialize_app()
        _firebase_initialized = True
        print("✅ Firebase Admin initialized")
        return True
    except Exception as e:
        print(f"⚠️ Firebase init warning: {e}")
        return False


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> AuthUser:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing authorization token")
    
    if not _init_firebase():
        raise HTTPException(status_code=503, detail="Auth service unavailable")
    
    token = credentials.credentials
    try:
        from firebase_admin import auth
        decoded = auth.verify_id_token(token)
        return AuthUser(
            uid=decoded.get("uid"),
            email=decoded.get("email"),
            name=decoded.get("name"),
            picture=decoded.get("picture"),
            role=decoded.get("role"),
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(exc)}") from exc
