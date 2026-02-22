import os
import asyncio
import google.generativeai as genai
from typing import List

# 1. Configuration
# Ensure your package is updated: pip install -U google-generativeai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use the current stable free-tier model
EMBEDDING_MODEL = "models/gemini-embedding-001"

async def get_embedding(text: str) -> List[float]:
    """
    Generate embedding for a document chunk.
    FIX: Forces output to 768 dimensions to match your database.
    """
    def _embed():
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_document",
            # CRITICAL FIX: Match your DB schema (768)
            output_dimensionality=768 
        )
        return result["embedding"]

    try:
        return await asyncio.to_thread(_embed)
    except Exception as e:
        print(f"Error in document embedding: {e}")
        return []

async def get_query_embedding(query: str) -> List[float]:
    """
    Generate embedding for a search query.
    FIX: Forces output to 768 dimensions.
    """
    def _embed():
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=query,
            task_type="retrieval_query",
            # CRITICAL FIX: Match your DB schema (768)
            output_dimensionality=768
        )
        return result["embedding"]

    try:
        return await asyncio.to_thread(_embed)
    except Exception as e:
        print(f"Error in query embedding: {e}")
        return []

async def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """Process multiple texts concurrently."""
    tasks = [get_embedding(text) for text in texts]
    return await asyncio.gather(*tasks)