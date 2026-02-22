from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.vector_store import get_all_chunks
from services.llm import generate_quiz

router = APIRouter()

class GenerateRequest(BaseModel):
    session_id: str

@router.post("/generate-quiz")
async def generate_quiz_endpoint(request: GenerateRequest):
    try:
        chunks = await get_all_chunks(request.session_id)
        
        if not chunks:
            raise HTTPException(
                status_code=404,
                detail="No content found for this session. Please upload a PDF or process a YouTube video first."
            )
        
        context = "\n\n".join(chunks[:20])
        questions = await generate_quiz(context)
        
        return {
            "status": "success",
            "session_id": request.session_id,
            "questions": questions,
            "count": len(questions)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")
