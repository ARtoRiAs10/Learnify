from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.vector_store import get_all_chunks
from services.llm import generate_flashcards

router = APIRouter()

class GenerateRequest(BaseModel):
    session_id: str

@router.post("/generate-flashcards")
async def generate_flashcards_endpoint(request: GenerateRequest):
    try:
        # Retrieve all content for this session
        chunks = await get_all_chunks(request.session_id)
        
        if not chunks:
            raise HTTPException(
                status_code=404,
                detail="No content found for this session. Please upload a PDF or process a YouTube video first."
            )
        
        # Combine chunks for context (limit to avoid token limits)
        context = "\n\n".join(chunks[:20])  # Use first 20 chunks
        
        # Generate flashcards
        flashcards = await generate_flashcards(context)
        
        return {
            "status": "success",
            "session_id": request.session_id,
            "flashcards": flashcards,
            "count": len(flashcards)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating flashcards: {str(e)}")
