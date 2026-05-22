"""
MindBridge — AI Wellness Companion Route
POST /ai/chat
"""
from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

from app.services.ai_service import chat_with_ai
from app.middleware.roles import require_student
from app.models.user import User
from app.limiter import limiter

router = APIRouter(prefix="/ai", tags=["AI Wellness Companion"])


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("30/minute")
async def ai_chat(
    request: Request,
    data: ChatRequest,
    current_user: User = Depends(require_student),
):
    """
    Send a message to MindBot and receive an empathetic AI response (FR-37).

    - History is passed from the client — NOT stored server-side (FR-41, privacy)
    - AI responds with empathy and coping suggestions (FR-38)
    - AI NEVER diagnoses conditions (FR-39)
    - Crisis resources are always included if self-harm is detected (FR-40)
    Rate limited: 30 messages per minute per IP.
    """
    history_dicts = [{"role": m.role, "content": m.content} for m in (data.history or [])]
    result = await chat_with_ai(data.message, history_dicts)
    return ChatResponse(reply=result["reply"])
