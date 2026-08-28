from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.config import Settings, get_settings
from app.core.database import SupabaseData
from app.dependencies.auth import AuthenticatedUser, current_user, data_client
from app.services.sam_service import SamService

router = APIRouter(prefix="/sam", tags=["sam"])


class SamQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    session_id: str | None = None


@router.get("/status")
async def sam_status(settings: Settings = Depends(get_settings)):
    service = SamService(settings)
    return service.get_status()


@router.post("/query")
async def ask_sam(
    payload: SamQueryRequest,
    user: AuthenticatedUser = Depends(current_user),
    db: SupabaseData = Depends(data_client),
    settings: Settings = Depends(get_settings),
):
    service = SamService(settings)
    try:
        response = await service.execute_query(payload.query, db)
        return response
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"SAM execution failed: {str(e)}")
