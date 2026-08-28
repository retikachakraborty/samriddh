from typing import Any

from pydantic import BaseModel, Field


class Page(BaseModel):
    items: list[dict[str, Any]]
    page: int
    page_size: int
    total: int | None = None


class Credentials(BaseModel):
    email: str
    password: str = Field(min_length=6)


class RefreshRequest(BaseModel):
    refresh_token: str


class Message(BaseModel):
    message: str
