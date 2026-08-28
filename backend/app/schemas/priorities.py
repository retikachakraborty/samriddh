from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


PriorityLevel = Literal["Critical", "High", "Medium", "Low"]
PriorityStatus = Literal["Open", "In Progress", "Completed", "Archived"]
RelatedEntityType = Literal["customer", "product", "country", "review", "general"]


class PriorityCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    priority_level: PriorityLevel = "Medium"
    status: PriorityStatus = "Open"
    related_entity_type: RelatedEntityType | None = None
    related_entity_id: str | None = None


class PriorityUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=2000)
    priority_level: PriorityLevel | None = None
    status: PriorityStatus | None = None
    related_entity_type: RelatedEntityType | None = None
    related_entity_id: str | None = None
    completed_at: datetime | None = None


class PriorityResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    priority_level: PriorityLevel
    status: PriorityStatus
    related_entity_type: RelatedEntityType | None = None
    related_entity_id: str | None = None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None
