from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.database import SupabaseData, SupabaseError
from app.dependencies.auth import data_client
from app.schemas.common import Page

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _page(page: int, page_size: int) -> tuple[int, int]:
    return (page - 1) * page_size, page_size


def _handle(error: SupabaseError) -> None:
    if error.status_code in (401, 403):
        raise HTTPException(status_code=error.status_code, detail="You do not have access to this data")
    raise HTTPException(status_code=502, detail="Supabase data request failed")


@router.get("/overview")
async def overview(db: SupabaseData = Depends(data_client)):
    try:
        data = await db.rpc("dashboard_overview")
        if isinstance(data, dict) and not data.get("top_products"):
            items, _ = await db.select(
                "products",
                columns="stock_code,description,revenue,quantity_sold,order_frequency,return_rate",
                order="revenue.desc",
                limit=10,
            )
            data["top_products"] = items or []
        return data
    except SupabaseError as error:
        _handle(error)


@router.get("/customers", response_model=Page)
async def customers(
    search: str | None = None,
    segment: str | None = None,
    country: str | None = None,
    high_value: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: SupabaseData = Depends(data_client),
):
    params: dict[str, str] = {}
    if search:
        params["or"] = f"customer_id.ilike.*{search}*,country.ilike.*{search}*,rfm_segment.ilike.*{search}*"
    if segment:
        params["rfm_segment"] = f"eq.{segment}"
    if country:
        params["country"] = f"eq.{country}"
    if high_value:
        params["rfm_segment"] = "in.(Champions,At-risk high value)"
    offset, limit = _page(page, page_size)
    try:
        items, total = await db.select("customers", params=params, offset=offset, limit=limit, order="monetary_value.desc", count=True)
        return Page(items=items, page=page, page_size=page_size, total=total)
    except SupabaseError as error:
        _handle(error)


@router.get("/customers/{customer_id}")
async def customer_detail(customer_id: str, db: SupabaseData = Depends(data_client)):
    try:
        items, _ = await db.select("customers", params={"customer_id": f"eq.{customer_id}"}, limit=1)
        if not items:
            raise HTTPException(status_code=404, detail="Customer not found")
        return items[0]
    except SupabaseError as error:
        _handle(error)


@router.get("/products", response_model=Page)
async def products(
    search: str | None = None,
    sort: str = Query("revenue", pattern="^(revenue|quantity_sold|return_rate|order_frequency)$"),
    descending: bool = True,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: SupabaseData = Depends(data_client),
):
    params = {"description": f"ilike.*{search}*"} if search else {}
    offset, limit = _page(page, page_size)
    order = f"{sort}.{'desc' if descending else 'asc'}"
    try:
        items, total = await db.select("products", params=params, offset=offset, limit=limit, order=order, count=True)
        return Page(items=items, page=page, page_size=page_size, total=total)
    except SupabaseError as error:
        _handle(error)


@router.get("/products/{stock_code}")
async def product_detail(stock_code: str, db: SupabaseData = Depends(data_client)):
    try:
        items, _ = await db.select("products", params={"stock_code": f"eq.{stock_code}"}, limit=1)
        if not items:
            raise HTTPException(status_code=404, detail="Product not found")
        return items[0]
    except SupabaseError as error:
        _handle(error)


@router.get("/countries")
async def countries(db: SupabaseData = Depends(data_client)):
    try:
        items, _ = await db.select("country_metrics", order="revenue.desc")
        return items
    except SupabaseError as error:
        _handle(error)


@router.get("/reviews/summary")
async def review_summary(db: SupabaseData = Depends(data_client)):
    try:
        return await db.rpc("review_summary")
    except SupabaseError as error:
        _handle(error)


@router.get("/reviews")
async def reviews(
    product_id: str | None = None,
    sentiment: str | None = Query(None, pattern="^(positive|negative|neutral)$"),
    verified: bool | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: SupabaseData = Depends(data_client),
):
    params: dict[str, str] = {}
    if product_id:
        params["product_id"] = f"eq.{product_id}"
    if sentiment:
        params["sentiment"] = f"eq.{sentiment}"
    if verified is not None:
        params["verified_purchase"] = f"eq.{str(verified).lower()}"
    offset, limit = _page(page, page_size)
    try:
        items, total = await db.select("reviews", params=params, offset=offset, limit=limit, order="review_date.desc", count=True)
        return Page(items=items, page=page, page_size=page_size, total=total)
    except SupabaseError as error:
        _handle(error)


@router.get("/reviews/products", response_model=Page)
async def review_products(
    category: str | None = None,
    sort: str = Query("review_count", pattern="^(review_count|average_rating|positive_pct|fake_rate|verified_pct)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: SupabaseData = Depends(data_client),
):
    params = {"category": f"eq.{category}"} if category else {}
    offset, limit = _page(page, page_size)
    try:
        items, total = await db.select("product_review_metrics", params=params, offset=offset, limit=limit, order=f"{sort}.desc", count=True)
        return Page(items=items, page=page, page_size=page_size, total=total)
    except SupabaseError as error:
        _handle(error)
