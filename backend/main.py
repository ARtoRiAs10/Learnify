import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.video import router as video_router
from routes.pdf import router as pdf_router
from routes.flashcards import router as flashcards_router
from routes.quiz import router as quiz_router
from routes.chat import router as chat_router

app = FastAPI(
    title="AI Learning Assistant API",
    description="RAG-powered learning assistant API with YouTube and PDF processing",
    version="1.0.0"
)

# CORS configuration
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(video_router, tags=["Video Processing"])
app.include_router(pdf_router, tags=["PDF Processing"])
app.include_router(flashcards_router, tags=["Flashcards"])
app.include_router(quiz_router, tags=["Quiz"])
app.include_router(chat_router, tags=["Chat"])

@app.get("/")
async def root():
    return {
        "message": "AI Learning Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": ["/process-video", "/process-pdf", "/generate-flashcards", "/generate-quiz", "/chat"]
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "model": "gemini-2.5-flash", "embeddings": "models/gemini-embedding-001"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
