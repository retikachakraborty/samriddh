from dataclasses import dataclass

import httpx
from fastapi import Depends, Header, HTTPException, status

from app.core.config import Settings, get_settings


@dataclass(frozen=True)
class AuthenticatedUser:
    id: str
    email: str | None
    role: str | None
    is_demo: bool
    token: str


def _token_from_header(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    token = authorization[7:].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    return token


async def current_user(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> AuthenticatedUser:
    token = _token_from_header(authorization)
    headers = {"apikey": settings.supabase_publishable_key, "Authorization": f"Bearer {token}"}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{settings.supabase_url}/auth/v1/user", headers=headers)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Authentication service unavailable") from exc
    if response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = response.json()
    email = user.get("email")
    user_metadata = user.get("user_metadata") or {}
    
    # Server-side Demo Mode detection
    is_demo = (
        email == "executive@samriddh.com"
        or user_metadata.get("role") == "demo"
        or user_metadata.get("is_demo") is True
        or user.get("role") == "demo"
    )

    return AuthenticatedUser(
        id=user["id"],
        email=email,
        role=user.get("role"),
        is_demo=is_demo,
        token=token,
    )


def require_non_demo_user(
    user: AuthenticatedUser = Depends(current_user),
) -> AuthenticatedUser:
    """Enforces server-side mutation protection for demo accounts."""
    if user.is_demo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo mode is read-only. Sign in with an authorized account to make changes.",
        )
    return user


def data_client(
    user: AuthenticatedUser = Depends(current_user),
    settings: Settings = Depends(get_settings),
):
    from app.core.database import SupabaseData

    return SupabaseData(settings, user.token)
