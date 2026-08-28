import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.core.config import Settings, get_settings
from app.schemas.common import Credentials, Message, RefreshRequest

router = APIRouter(prefix="/auth", tags=["authentication"])


async def _auth_request(settings: Settings, path: str, payload: dict):
    headers = {"apikey": settings.supabase_publishable_key, "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(f"{settings.supabase_url}/auth/v1/{path}", json=payload, headers=headers)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Authentication service unavailable") from exc
    if response.is_error:
        try:
            detail = response.json().get("msg") or response.json().get("error_description") or response.json()
        except ValueError:
            detail = "Authentication request failed"
        raise HTTPException(status_code=response.status_code, detail=detail)
    return response.json()


@router.post("/signup")
async def signup(credentials: Credentials, settings: Settings = Depends(get_settings)):
    return await _auth_request(settings, "signup", credentials.model_dump())


@router.post("/signin")
async def signin(credentials: Credentials, settings: Settings = Depends(get_settings)):
    return await _auth_request(settings, "token?grant_type=password", credentials.model_dump())


@router.post("/refresh")
async def refresh(body: RefreshRequest, settings: Settings = Depends(get_settings)):
    return await _auth_request(settings, "token?grant_type=refresh_token", body.model_dump())


@router.get("/me")
async def me(user=Depends(__import__("app.dependencies.auth", fromlist=["current_user"]).current_user)):
    return {"id": user.id, "email": user.email, "role": user.role}


@router.post("/signout", response_model=Message)
async def signout(user=Depends(__import__("app.dependencies.auth", fromlist=["current_user"]).current_user), settings: Settings = Depends(get_settings)):
    headers = {"apikey": settings.supabase_publishable_key, "Authorization": f"Bearer {user.token}"}
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(f"{settings.supabase_url}/auth/v1/logout", headers=headers)
    if response.is_error:
        raise HTTPException(status_code=response.status_code, detail="Could not sign out")
    return {"message": "Signed out"}
