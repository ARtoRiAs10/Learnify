import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from services.vector_store import retrieve_relevant_chunks
from services.llm import chat_with_context

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: str
    history: Optional[List[ChatMessage]] = []

async def stream_response(message: str, session_id: str, history: List[dict]):
    """Generator that yields SSE events."""
    try:
        # Retrieve relevant context using RAG
        context_chunks = await retrieve_relevant_chunks(session_id, message, top_k=5)
        
        # Stream response
        async for chunk in chat_with_context(message, context_chunks, history):
            data = json.dumps({"content": chunk})
            yield f"data: {data}\n\n"
        
        yield "data: [DONE]\n\n"
    
    except Exception as e:
        error_data = json.dumps({"error": str(e)})
        yield f"data: {error_data}\n\n"
        yield "data: [DONE]\n\n"

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    history = [{"role": m.role, "content": m.content} for m in (request.history or [])]
    
    return StreamingResponse(
        stream_response(request.message, request.session_id, history),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )
