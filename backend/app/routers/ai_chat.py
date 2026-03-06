from __future__ import annotations

import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

import litellm

from app.database import get_db
from app.models import AISettings, Engagement
from app.schemas import AIChatRequest, AIChatResponse, ChatMessage

router = APIRouter(prefix="/api/ai", tags=["ai"])


def _get_settings(db: Session) -> AISettings:
    settings = db.query(AISettings).first()
    if not settings:
        raise HTTPException(status_code=400, detail="AI not configured. Please set up your AI provider in Settings.")
    if not settings.api_key and settings.provider != "ollama":
        raise HTTPException(status_code=400, detail="API key not set. Please add your API key in Settings.")
    return settings


def _build_engagement_context(engagement: Engagement) -> str:
    parts = [f"Engagement: {engagement.title}"]
    if engagement.client_name:
        parts.append(f"Client: {engagement.client_name}")
    if engagement.service_category:
        parts.append(f"Service Category: {engagement.service_category}")
    if engagement.service_type:
        parts.append(f"Service Type: {engagement.service_type}")
    if engagement.description:
        parts.append(f"Description: {engagement.description}")
    if engagement.scope:
        parts.append(f"Scope: {engagement.scope}")
    if engagement.ambition_level:
        parts.append(f"Ambition Level: {engagement.ambition_level}")
    if engagement.success_criteria:
        parts.append(f"Success Criteria: {engagement.success_criteria}")
    return "\n".join(parts)


def _prepare_litellm_call(settings: AISettings, messages: list[dict], engagement: Engagement | None):
    """Prepare the kwargs for litellm.completion()."""
    model = settings.model
    # LiteLLM expects provider-prefixed model names for some providers
    # For OpenAI models, no prefix needed. For others, prefix may already be included.

    kwargs: dict = {
        "model": model,
        "messages": [],
    }

    # Set API key
    if settings.api_key:
        kwargs["api_key"] = settings.api_key

    # Set base URL for custom endpoints
    if settings.base_url:
        kwargs["api_base"] = settings.base_url

    # Build messages with optional engagement context
    if engagement:
        context = _build_engagement_context(engagement)
        kwargs["messages"].append({
            "role": "system",
            "content": f"You are an AI assistant for a consulting engagement. Here is the engagement context:\n\n{context}\n\nUse this context to inform your responses when relevant.",
        })

    kwargs["messages"].extend(messages)

    return kwargs


@router.post("/chat", response_model=AIChatResponse)
def chat(req: AIChatRequest, db: Session = Depends(get_db)):
    settings = _get_settings(db)

    engagement = None
    if req.engagement_id:
        engagement = db.query(Engagement).filter(Engagement.id == req.engagement_id).first()

    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    kwargs = _prepare_litellm_call(settings, messages, engagement)

    try:
        response = litellm.completion(**kwargs)
    except litellm.AuthenticationError:
        raise HTTPException(status_code=401, detail="Authentication failed. Please check your API key in Settings.")
    except litellm.RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")
    except litellm.BadRequestError as e:
        raise HTTPException(status_code=400, detail=f"Bad request: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI request failed: {str(e)}")

    content = response.choices[0].message.content or ""

    return AIChatResponse(
        message=ChatMessage(role="assistant", content=content),
        model=settings.model,
        provider=settings.provider,
    )


@router.post("/chat/stream")
def chat_stream(req: AIChatRequest, db: Session = Depends(get_db)):
    settings = _get_settings(db)

    engagement = None
    if req.engagement_id:
        engagement = db.query(Engagement).filter(Engagement.id == req.engagement_id).first()

    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    kwargs = _prepare_litellm_call(settings, messages, engagement)
    kwargs["stream"] = True

    def generate():
        try:
            response = litellm.completion(**kwargs)
            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    data = json.dumps({"content": chunk.choices[0].delta.content})
                    yield f"data: {data}\n\n"
            yield "data: [DONE]\n\n"
        except litellm.AuthenticationError:
            yield f"data: {json.dumps({'error': 'Authentication failed. Check your API key.'})}\n\n"
        except litellm.RateLimitError:
            yield f"data: {json.dumps({'error': 'Rate limit exceeded. Try again later.'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
