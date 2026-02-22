import os
import json
import asyncio
import google.generativeai as genai
from typing import List, Dict, AsyncGenerator
from youtube_transcript_api import YouTubeTranscriptApi

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# gemini-1.5-flash: free tier — 15 RPM, 1M tokens/day
MODEL_NAME = "gemini-3-flash-preview"


def get_model() -> genai.GenerativeModel:
    return genai.GenerativeModel(MODEL_NAME)


async def generate_flashcards(context: str) -> List[Dict]:
    """Generate 10-15 flashcards from context as structured JSON."""
    model = get_model()

    prompt = f"""Based on the following educational content, generate exactly 12 flashcards.
Each flashcard should test a key concept, fact, or understanding.

Content:
{context[:8000]}

Return ONLY a valid JSON array with this exact structure:
[
  {{
    "question": "Clear, specific question",
    "answer": "Concise, accurate answer (1-3 sentences)"
  }}
]

Generate exactly 12 diverse flashcards covering different aspects of the content."""

    def _generate():
        return model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.4,
                response_mime_type="application/json",
            ),
        )

    # FIX: run sync call in thread pool
    response = await asyncio.to_thread(_generate)

    text = response.text.strip()
    # Strip markdown code fences if Gemini wraps the JSON
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]

    return json.loads(text.strip())


async def generate_quiz(context: str) -> List[Dict]:
    """Generate 8 multiple-choice quiz questions as structured JSON."""
    model = get_model()

    prompt = f"""Based on the following educational content, generate 8 multiple-choice quiz questions.
Questions should test comprehension at different difficulty levels.

Content:
{context[:8000]}

Return ONLY a valid JSON array with this exact structure:
[
  {{
    "question": "Clear question text",
    "options": [
      {{"label": "A", "text": "First option"}},
      {{"label": "B", "text": "Second option"}},
      {{"label": "C", "text": "Third option"}},
      {{"label": "D", "text": "Fourth option"}}
    ],
    "correct_answer": "A",
    "explanation": "Why this answer is correct (1-2 sentences)"
  }}
]

Make sure exactly one answer is correct. Vary difficulty from easy to hard."""

    def _generate():
        return model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.4,
                response_mime_type="application/json",
            ),
        )

    response = await asyncio.to_thread(_generate)

    text = response.text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]

    return json.loads(text.strip())


async def chat_with_context(
    message: str,
    context_chunks: List[str],
    history: List[Dict],
) -> AsyncGenerator[str, None]:
    """
    Stream a chat response using RAG-retrieved context chunks.
    """
    model = get_model()

    context = (
        "\n\n---\n\n".join(context_chunks)
        if context_chunks
        else "No specific context available. Answer from general knowledge."
    )

    system_prompt = (
        f"You are an intelligent AI learning assistant. "
        f"Answer questions based on the provided context. "
        f"If the answer isn't in the context, say so and provide general knowledge.\n\n"
        f"CONTEXT FROM USER'S CONTENT:\n{context[:6000]}\n\n"
        f"Be concise, clear, and educational."
    )

    # Build Gemini chat history format
    chat_history = []
    for msg in history[-6:]:
        if msg["role"] == "user":
            chat_history.append({"role": "user", "parts": [msg["content"]]})
        elif msg["role"] == "assistant":
            chat_history.append({"role": "model", "parts": [msg["content"]]})

    # Use a queue to bridge sync streaming → async generator
    queue: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_event_loop()

    def _stream_in_thread():
        """Runs in a thread pool. Puts text chunks into the queue."""
        try:
            chat = model.start_chat(history=chat_history)
            full_message = f"{system_prompt}\n\nUser question: {message}"
            response = chat.send_message(full_message, stream=True)
            for chunk in response:
                if chunk.text:
                    # Thread-safe: schedule put_nowait on the event loop
                    loop.call_soon_threadsafe(queue.put_nowait, chunk.text)
        except Exception as e:
            loop.call_soon_threadsafe(queue.put_nowait, f"\n\n⚠️ Error: {str(e)}")
        finally:
            # Sentinel to signal completion
            loop.call_soon_threadsafe(queue.put_nowait, None)

    # Run the blocking stream in a thread pool
    asyncio.ensure_future(asyncio.to_thread(_stream_in_thread))

    # Yield chunks from the queue as they arrive
    while True:
        chunk = await queue.get()
        if chunk is None:
            break
        yield chunk



async def safe_generate_educational_content(context: str, mode: str = "flashcards"):
    """
    Wraps your existing generation functions with a safety check.
    """
    # CRITICAL: This check prevents the 422 'Unprocessable Entity' error
    if not context or len(context.strip()) < 50:
        return {"error": "Insufficient content provided to generate study materials."}

    if mode == "flashcards":
        return await generate_flashcards(context)
    elif mode == "quiz":
        return await generate_quiz(context)

async def get_video_content(video_id: str) -> str:
    """
    Extracts text from a YouTube video. 
    Attempts API transcript first, then falls back to AI Vision.
    """
    try:
        # Standard Transcript API
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join([t['text'] for t in transcript_list])
    except Exception as e:
        print(f"Transcript API failed: {e}. Attempting AI Vision fallback...")
        
        # 2026 Fallback: Gemini 1.5/2.0 can 'read' video audio/visuals via URL
        model = get_model()
        url = f"https://www.youtube.com/watch?v={video_id}"
        
        def _ai_vision():
            return model.generate_content([
                url, 
                "Provide a detailed transcript or summary of the dialogue in this video."
            ])
        
        try:
            response = await asyncio.to_thread(_ai_vision)
            return response.text
        except Exception as vision_err:
            print(f"AI Vision failed: {vision_err}")
            return ""