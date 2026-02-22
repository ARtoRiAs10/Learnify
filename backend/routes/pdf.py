from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from langchain_text_splitters import RecursiveCharacterTextSplitter
from services.vector_store import store_chunks
import pdfplumber
import io

router = APIRouter()

@router.post("/process-pdf")
async def process_pdf(
    file: UploadFile = File(...),
    session_id: str = Form(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
    
    if file.size and file.size > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 20MB.")
    
    try:
        content = await file.read()
        
        # Extract text using pdfplumber
        full_text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            num_pages = len(pdf.pages)
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n\n"
        
        if not full_text.strip():
            raise HTTPException(status_code=422, detail="Could not extract text from PDF. It may be scanned or image-based.")
        
        # Chunk the text
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        chunks = splitter.split_text(full_text)
        
        # Store in vector database
        num_chunks = await store_chunks(session_id, chunks, source_type="pdf")
        
        return {
            "status": "success",
            "filename": file.filename,
            "pages": num_pages,
            "chunks": num_chunks,
            "characters": len(full_text),
            "message": f"Successfully processed {num_pages} pages into {num_chunks} chunks"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
