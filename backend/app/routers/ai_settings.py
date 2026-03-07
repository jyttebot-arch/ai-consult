from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AISettings
from app.schemas import AISettingsUpdate, AISettingsOut

router = APIRouter(prefix="/api/ai", tags=["ai"])

PROVIDER_MODELS = {
    "openai": ["gpt-4o", "gpt-4o-mini", "o1", "o3-mini"],
    "anthropic": ["claude-sonnet-4-20250514", "claude-haiku-35-20241022", "claude-opus-4-20250514"],
    "google": ["gemini/gemini-2.0-flash", "gemini/gemini-2.5-pro"],
    "mistral": ["mistral/mistral-large-latest", "mistral/mistral-small-latest"],
    "openrouter": [
        "openrouter/anthropic/claude-sonnet-4",
        "openrouter/anthropic/claude-haiku-4",
        "openrouter/google/gemini-2.5-pro",
        "openrouter/openai/gpt-4o",
        "openrouter/meta-llama/llama-4-maverick",
    ],
    "ollama": ["ollama/llama3", "ollama/mistral", "ollama/codellama"],
}


def _get_or_create_settings(db: Session) -> AISettings:
    settings = db.query(AISettings).first()
    if not settings:
        settings = AISettings(provider="openai", model="gpt-4o")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def _mask_key(key: str | None) -> bool:
    return key is not None and len(key) > 0


@router.get("/settings", response_model=AISettingsOut)
def get_settings(db: Session = Depends(get_db)):
    settings = _get_or_create_settings(db)
    return AISettingsOut(
        id=settings.id,
        provider=settings.provider,
        model=settings.model,
        api_key_set=_mask_key(settings.api_key),
        base_url=settings.base_url,
        updated_at=settings.updated_at,
    )


@router.put("/settings", response_model=AISettingsOut)
def update_settings(data: AISettingsUpdate, db: Session = Depends(get_db)):
    settings = _get_or_create_settings(db)

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)

    return AISettingsOut(
        id=settings.id,
        provider=settings.provider,
        model=settings.model,
        api_key_set=_mask_key(settings.api_key),
        base_url=settings.base_url,
        updated_at=settings.updated_at,
    )


@router.get("/models")
def list_models():
    return PROVIDER_MODELS
