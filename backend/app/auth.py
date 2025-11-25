from functools import lru_cache
from typing import Optional

import firebase_admin
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from pydantic import BaseModel

security = HTTPBearer(auto_error=False)


class AuthUser(BaseModel):
    uid: str
    email: Optional[str]
    name: Optional[str]
    picture: Optional[str]
    role: Optional[str]


@lru_cache
def _init_firebase_app():
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    return firebase_admin.get_app()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> AuthUser:
    _ = _init_firebase_app()
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing authorization token")
    token = credentials.credentials
    try:
        decoded = auth.verify_id_token(token)
    except Exception as exc:  # firebase_admin.AuthError not exported
        raise HTTPException(status_code=401, detail="Invalid token") from exc
    return AuthUser(
        uid=decoded.get("uid"),
        email=decoded.get("email"),
        name=decoded.get("name"),
        picture=decoded.get("picture"),
        role=decoded.get("role"),
    )



