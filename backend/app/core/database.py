from collections.abc import Mapping
from typing import Any

import httpx

from app.core.config import Settings


class SupabaseError(RuntimeError):
    def __init__(self, status_code: int, detail: Any):
        self.status_code = status_code
        self.detail = detail
        super().__init__(str(detail))


class SupabaseData:
    """Async PostgREST client using the caller's authenticated JWT."""

    def __init__(self, settings: Settings, token: str):
        self.settings = settings
        self.token = token
        self.base = f"{settings.supabase_url}/rest/v1"

    @property
    def headers(self) -> dict[str, str]:
        return {
            "apikey": self.settings.supabase_publishable_key,
            "Authorization": f"Bearer {self.token}",
            "Accept-Profile": "public",
            "Content-Profile": "public",
        }

    async def request(
        self,
        method: str,
        path: str,
        *,
        params: Mapping[str, str] | None = None,
        json: Any = None,
        headers: Mapping[str, str] | None = None,
    ) -> Any:
        request_headers = {**self.headers, **(headers or {})}
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.request(
                method,
                f"{self.base}/{path.lstrip('/')}",
                params=params,
                json=json,
                headers=request_headers,
            )
        if response.is_error:
            try:
                detail = response.json()
            except ValueError:
                detail = response.text
            raise SupabaseError(response.status_code, detail)
        if not response.content:
            return None
        return response.json()

    async def select(
        self,
        table: str,
        *,
        columns: str = "*",
        params: Mapping[str, str] | None = None,
        offset: int | None = None,
        limit: int | None = None,
        order: str | None = None,
        count: bool = False,
    ) -> tuple[Any, int | None]:
        query = {"select": columns, **(params or {})}
        if order:
            query["order"] = order
        if offset is not None and limit is not None:
            query["offset"] = str(offset)
            query["limit"] = str(limit)
        extra = {"Prefer": "count=exact"} if count else {}
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                f"{self.base}/{table}",
                params=query,
                headers={**self.headers, **extra},
            )
        if response.is_error:
            try:
                detail = response.json()
            except ValueError:
                detail = response.text
            raise SupabaseError(response.status_code, detail)
        total = None
        if count:
            content_range = response.headers.get("content-range", "")
            if "/" in content_range and content_range.rsplit("/", 1)[1] != "*":
                total = int(content_range.rsplit("/", 1)[1])
        return response.json(), total

    async def insert(self, table: str, data: dict[str, Any]) -> dict[str, Any]:
        headers = {"Prefer": "return=representation"}
        res = await self.request("POST", table, json=data, headers=headers)
        if isinstance(res, list) and res:
            return res[0]
        return res

    async def update(self, table: str, params: Mapping[str, str], data: dict[str, Any]) -> dict[str, Any]:
        headers = {"Prefer": "return=representation"}
        res = await self.request("PATCH", table, params=params, json=data, headers=headers)
        if isinstance(res, list) and res:
            return res[0]
        return res

    async def delete(self, table: str, params: Mapping[str, str]) -> None:
        await self.request("DELETE", table, params=params)

    async def rpc(self, function: str, payload: dict[str, Any] | None = None) -> Any:
        return await self.request("POST", f"rpc/{function}", json=payload or {})
