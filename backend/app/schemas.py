from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel


# ---------- Phase ----------

class PhaseBase(BaseModel):
    name: str
    order: int
    start_date: str | None = None
    end_date: str | None = None
    status: str = "not_started"


class PhaseCreate(PhaseBase):
    pass


class PhaseUpdate(BaseModel):
    name: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    status: str | None = None


class PhaseOut(PhaseBase):
    id: int
    engagement_id: int

    class Config:
        from_attributes = True


# ---------- Hypothesis ----------

class HypothesisBase(BaseModel):
    statement: str
    status: str = "open"
    evidence_summary: str | None = None


class HypothesisCreate(HypothesisBase):
    pass


class HypothesisUpdate(BaseModel):
    statement: str | None = None
    status: str | None = None
    evidence_summary: str | None = None


class HypothesisOut(HypothesisBase):
    id: int
    engagement_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Engagement ----------

class EngagementBase(BaseModel):
    title: str
    client_name: str
    service_category: str
    service_type: str | None = None
    description: str | None = None
    scope: str | None = None
    ambition_level: str | None = None
    success_criteria: str | None = None
    status: str = "draft"


class EngagementCreate(EngagementBase):
    pass


class EngagementUpdate(BaseModel):
    title: str | None = None
    client_name: str | None = None
    service_category: str | None = None
    service_type: str | None = None
    description: str | None = None
    scope: str | None = None
    ambition_level: str | None = None
    success_criteria: str | None = None
    status: str | None = None


class EngagementOut(EngagementBase):
    id: int
    created_at: datetime
    updated_at: datetime
    phases: list[PhaseOut] = []
    hypotheses: list[HypothesisOut] = []

    class Config:
        from_attributes = True


class EngagementListOut(EngagementBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- AI Settings ----------

class AISettingsUpdate(BaseModel):
    provider: str | None = None
    model: str | None = None
    api_key: str | None = None
    base_url: str | None = None


class AISettingsOut(BaseModel):
    id: int
    provider: str
    model: str
    api_key_set: bool
    base_url: str | None
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- AI Chat ----------

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class AIChatRequest(BaseModel):
    messages: list[ChatMessage]
    engagement_id: int | None = None


class AIChatResponse(BaseModel):
    message: ChatMessage
    model: str
    provider: str
