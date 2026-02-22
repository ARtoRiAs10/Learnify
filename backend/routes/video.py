# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from services.vector_store import store_chunks
# import re

# router = APIRouter()

# class VideoRequest(BaseModel):
#     url: str
#     session_id: str

# def extract_video_id(url: str) -> str:
#     """Extract YouTube video ID from URL."""
#     patterns = [
#         r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s\?]+)',
#     ]
#     for pattern in patterns:
#         match = re.search(pattern, url)
#         if match:
#             return match.group(1)
#     raise ValueError("Invalid YouTube URL")

# @router.post("/process-video")
# async def process_video(request: VideoRequest):
#     try:
#         video_id = extract_video_id(request.url)
        
#         # Get transcript
#         try:
#             transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
#         except NoTranscriptFound:
#             # Try auto-generated captions
#             transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'en-US', 'en-GB'])
        
#         # Combine transcript text
#         full_transcript = " ".join([t["text"] for t in transcript_list])
#         full_transcript = full_transcript.replace("\n", " ").strip()
        
#         # Calculate approximate duration
#         duration_seconds = int(transcript_list[-1]["start"] + transcript_list[-1]["duration"]) if transcript_list else 0
#         minutes = duration_seconds // 60
#         seconds = duration_seconds % 60
#         duration_str = f"{minutes}m {seconds}s"
        
#         # Chunk the transcript
#         splitter = RecursiveCharacterTextSplitter(
#             chunk_size=1000,
#             chunk_overlap=200,
#             separators=["\n\n", "\n", ". ", " ", ""]
#         )
#         chunks = splitter.split_text(full_transcript)
        
#         # Store in vector database
#         num_chunks = await store_chunks(request.session_id, chunks, source_type="youtube")
        
#         return {
#             "status": "success",
#             "video_id": video_id,
#             "transcript": full_transcript[:3000] + ("..." if len(full_transcript) > 3000 else ""),
#             "title": f"YouTube Video ({video_id})",
#             "duration": duration_str,
#             "chunks": num_chunks,
#             "message": f"Successfully processed video transcript with {num_chunks} chunks"
#         }
    
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     except (TranscriptsDisabled, NoTranscriptFound):
#         raise HTTPException(
#             status_code=422,
#             detail="No transcript available for this video. The video may not have captions enabled."
#         )
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")


from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from langchain_text_splitters import RecursiveCharacterTextSplitter
# Import your Gemini service here (adjust path as needed)
from services.llm import get_video_content 
from services.vector_store import store_chunks
import re

router = APIRouter()

class VideoRequest(BaseModel):
    url: str
    session_id: str

def extract_video_id(url: str) -> str:
    """Robust extraction of YouTube ID."""
    # Updated regex to handle ?si= and other params
    pattern = r"(?:v=|\/|embed\/|shorts\/)([0-9A-Za-z_-]{11})"
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    raise ValueError("Invalid YouTube URL")

@router.post("/process-video")
async def process_video(request: VideoRequest):
    try:
        video_id = extract_video_id(request.url)
        full_transcript = ""

        # Step 1: Try Standard Transcript API
        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'en-US'])
            full_transcript = " ".join([t["text"] for t in transcript_list])
        except (TranscriptsDisabled, NoTranscriptFound, Exception):
            # Step 2: FALLBACK to Gemini AI Vision
            # This prevents the 422 error!
            print(f"Transcript API failed for {video_id}. Calling Gemini fallback...")
            full_transcript = await get_video_content(video_id)

        # Final Guard: If Gemini also fails to get content
        if not full_transcript or len(full_transcript.strip()) < 50:
            raise HTTPException(
                status_code=400, 
                detail="Could not extract content. Please try a video with English captions."
            )

        full_transcript = full_transcript.replace("\n", " ").strip()
        
        # ... (Rest of your chunking and duration logic) ...
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_text(full_transcript)
        num_chunks = await store_chunks(request.session_id, chunks, source_type="youtube")

        return {
            "status": "success",
            "video_id": video_id,
            "transcript": full_transcript[:3000],
            "chunks": num_chunks
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Error: {str(e)}")