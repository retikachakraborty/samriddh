from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import SupabaseData, SupabaseError
from app.dependencies.auth import AuthenticatedUser, current_user, data_client, require_non_demo_user
from app.schemas.priorities import PriorityCreate, PriorityResponse, PriorityUpdate

router = APIRouter(prefix="/priorities", tags=["priorities"])

INITIAL_DATABASE_PRIORITIES = [
    {
        "title": "Reverse Mid-Year Revenue Dip & Stabilize £10.63M Run Rate",
        "description": "Verified sales data indicates peak monthly revenue reached £821.5K in Q4 before dropping in Q2. Initiate targeted re-order campaigns for high-volume wholesale buyers.",
        "priority_level": "Critical",
        "status": "In Progress",
        "related_entity_type": "general",
    },
    {
        "title": "Reactivate 135 At-Risk High-Value Accounts",
        "description": "RFM customer segmentation indexed 135 Champions and High-Value accounts in the At-Risk tier with >120 days recency. Deploy dedicated executive account outreach.",
        "priority_level": "High",
        "status": "Open",
        "related_entity_type": "customer",
    },
    {
        "title": "Resolve Packaging Fragility for Top Returned Glassware SKUs",
        "description": "Product performance records identify top return items with return quantities exceeding 1,200 units. Upgrade transit bubble-wrap specifications for delicate giftware items.",
        "priority_level": "High",
        "status": "Open",
        "related_entity_type": "product",
    },
    {
        "title": "Mitigate Transit Delay Complaints in 100K Review Stream",
        "description": "Voice of Customer sentiment analysis across 100,000 verified reviews highlights transit delays as the #1 negative aspect (43% negative sentiment). Partner with regional courier hubs.",
        "priority_level": "Medium",
        "status": "Open",
        "related_entity_type": "review",
    },
    {
        "title": "Scale European Wholesale Corridor Beyond £9.36M UK Baseline",
        "description": "UK accounts generate 88% of total revenue. Expand localized marketing and B2B catalog bundling in high-AOV European markets (EIRE, Netherlands, Germany).",
        "priority_level": "Medium",
        "status": "Open",
        "related_entity_type": "country",
    },
]


def _handle_db_error(error: SupabaseError) -> None:
    if error.status_code in (401, 403):
        raise HTTPException(status_code=error.status_code, detail="Permission denied")
    raise HTTPException(status_code=502, detail="Database request failed")


@router.get("", response_model=list[PriorityResponse])
async def list_priorities(
    status_filter: str | None = Query(None, alias="status"),
    priority_level: str | None = Query(None, alias="priority_level"),
    user: AuthenticatedUser = Depends(current_user),
    db: SupabaseData = Depends(data_client),
):
    params: dict[str, str] = {"user_id": f"eq.{user.id}"}
    if status_filter:
        params["status"] = f"eq.{status_filter}"
    if priority_level:
        params["priority_level"] = f"eq.{priority_level}"

    try:
        items, _ = await db.select(
            "priorities",
            params=params,
            order="created_at.desc",
        )

        # Auto-seed initial 5 real database priorities if empty and unfiltered
        if not items and not status_filter and not priority_level:
            now_iso = datetime.now(timezone.utc).isoformat()
            seeded = []
            for initial in INITIAL_DATABASE_PRIORITIES:
                rec = {
                    "user_id": user.id,
                    **initial,
                    "created_at": now_iso,
                    "updated_at": now_iso,
                }
                try:
                    res = await db.insert("priorities", rec)
                    if res:
                        seeded.append(res)
                except Exception:
                    pass
            if seeded:
                return seeded

        return items or []
    except SupabaseError as error:
        _handle_db_error(error)


@router.post("", response_model=PriorityResponse, status_code=status.HTTP_201_CREATED)
async def create_priority(
    payload: PriorityCreate,
    user: AuthenticatedUser = Depends(require_non_demo_user),
    db: SupabaseData = Depends(data_client),
):
    now_iso = datetime.now(timezone.utc).isoformat()
    record: dict[str, Any] = {
        "user_id": user.id,
        "title": payload.title.strip(),
        "description": payload.description.strip(),
        "priority_level": payload.priority_level,
        "status": payload.status,
        "related_entity_type": payload.related_entity_type,
        "related_entity_id": payload.related_entity_id,
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    if payload.status == "Completed":
        record["completed_at"] = now_iso

    try:
        created = await db.insert("priorities", record)
        return created
    except SupabaseError as error:
        _handle_db_error(error)


@router.patch("/{priority_id}", response_model=PriorityResponse)
async def update_priority(
    priority_id: str,
    payload: PriorityUpdate,
    user: AuthenticatedUser = Depends(require_non_demo_user),
    db: SupabaseData = Depends(data_client),
):
    now_iso = datetime.now(timezone.utc).isoformat()
    updates: dict[str, Any] = {"updated_at": now_iso}

    if payload.title is not None:
        updates["title"] = payload.title.strip()
    if payload.description is not None:
        updates["description"] = payload.description.strip()
    if payload.priority_level is not None:
        updates["priority_level"] = payload.priority_level
    if payload.status is not None:
        updates["status"] = payload.status
        if payload.status == "Completed":
            updates["completed_at"] = now_iso
        elif payload.status == "Open":
            updates["completed_at"] = None

    try:
        updated = await db.update(
            "priorities",
            params={"id": f"eq.{priority_id}", "user_id": f"eq.{user.id}"},
            data=updates,
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Priority not found")
        return updated
    except SupabaseError as error:
        _handle_db_error(error)


@router.delete("/{priority_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_priority(
    priority_id: str,
    user: AuthenticatedUser = Depends(require_non_demo_user),
    db: SupabaseData = Depends(data_client),
):
    try:
        await db.delete(
            "priorities",
            params={"id": f"eq.{priority_id}", "user_id": f"eq.{user.id}"},
        )
    except SupabaseError as error:
        _handle_db_error(error)
