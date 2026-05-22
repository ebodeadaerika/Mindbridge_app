"""
MindBridge — AI Wellness Companion Service
Uses Groq (free tier) with Llama 3.1 70B via an OpenAI-compatible API.
Switch provider by changing AI_API_URL + AI_MODEL in .env — no code change needed.

Key rules (FR-37 to FR-41):
- Responds with empathy, suggests coping strategies
- NEVER diagnoses medical/psychiatric conditions
- ALWAYS includes crisis resources if self-harm is detected
- Conversation history is NOT stored server-side (privacy)
"""
import httpx
from typing import List, Dict
from fastapi import HTTPException, status
from app.config import settings

# System prompt — defines the AI companion's personality and safety constraints
MINDBOT_SYSTEM_PROMPT = """You are MindBot, an empathetic AI wellness companion for MindBridge —
a student mental health platform at ICT University of Cameroon. Your role is to provide
compassionate, non-judgmental support to university students.

CORE RULES — never break these:
1. Respond with warmth, empathy, and understanding at all times
2. Suggest evidence-based coping strategies (deep breathing, journaling, grounding techniques)
3. NEVER diagnose any medical or psychiatric condition — you are not a doctor
4. If a student expresses thoughts of self-harm or suicide, ALWAYS include:
   "Please reach out immediately: Crisis Text Line — text HOME to 741741, or call 988 (Suicide & Crisis Lifeline)"
5. Encourage professional help when appropriate: "A campus counsellor can provide more personalised support"
6. Keep responses warm but concise — 2-4 paragraphs maximum
7. Use first person and address the student directly
8. Never repeat the same suggestion twice in a conversation
9. This conversation is completely private — you do not store or share anything

Remember: You are a first point of contact, not a replacement for professional mental health care."""

CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "self harm", "self-harm",
    "hurt myself", "don't want to live", "not worth living", "give up",
    "no reason to live", "better off dead",
]


def _contains_crisis_language(message: str) -> bool:
    """Detect if the message contains crisis-related language."""
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in CRISIS_KEYWORDS)


async def chat_with_ai(message: str, history: List[Dict[str, str]]) -> Dict[str, str]:
    """
    Send a message to the Groq API (Llama 3.1 70B) and return an empathetic response.
    Uses OpenAI-compatible chat completions format.
    History is passed from the client — NOT stored on the server (FR-41).
    """
    if not settings.AI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI Companion is not configured. Please contact your administrator.",
        )

    # Enhance system prompt if crisis language detected
    system = MINDBOT_SYSTEM_PROMPT
    if _contains_crisis_language(message):
        system += "\n\nCRITICAL: This message contains potential crisis language. Include the crisis hotline information immediately."

    # Build messages array: system prompt first, then history, then new user message
    messages = [{"role": "system", "content": system}]
    for h in history:
        if h.get("role") in ("user", "assistant") and h.get("content"):
            messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                settings.AI_API_URL,
                headers={
                    "Authorization": f"Bearer {settings.AI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.AI_MODEL,
                    "messages": messages,
                    "max_tokens": 1024,
                    "temperature": 0.7,
                },
            )
            response.raise_for_status()
            data = response.json()
            reply = data["choices"][0]["message"]["content"]

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="MindBot took too long to respond. Please try again.",
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service returned an error. Please try again later.",
        )

    return {"reply": reply}
