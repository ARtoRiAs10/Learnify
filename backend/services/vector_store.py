# import os
# from supabase import create_client, Client
# from typing import List, Dict, Any
# from services.embeddings import get_embedding, get_query_embedding
# from dotenv import load_dotenv

# load_dotenv()

# supabase: Client = create_client(
#     os.getenv("SUPABASE_URL", ""),
#     os.getenv("SUPABASE_SERVICE_KEY", "")
# )

# TABLE_NAME = "document_chunks"

# async def store_chunks(session_id: str, chunks: List[str], source_type: str = "pdf"):
#     """Store text chunks with embeddings in Supabase pgvector."""
#     records = []
#     for i, chunk in enumerate(chunks):
#         embedding = await get_embedding(chunk)
#         records.append({
#             "session_id": session_id,
#             "chunk_index": i,
#             "content": chunk,
#             "embedding": embedding,
#             "source_type": source_type,
#         })
    
#     # Upsert in batches of 10
#     for i in range(0, len(records), 10):
#         batch = records[i:i+10]
#         supabase.table(TABLE_NAME).upsert(batch).execute()
    
#     return len(records)

# async def retrieve_relevant_chunks(session_id: str, query: str, top_k: int = 5) -> List[str]:
#     """Retrieve the most relevant chunks using vector similarity search."""
#     query_embedding = await get_query_embedding(query)
    
#     # Use Supabase RPC for vector similarity search
#     result = supabase.rpc(
#         "match_document_chunks",
#         {
#             "query_embedding": query_embedding,
#             "match_session_id": session_id,
#             "match_count": top_k,
#         }
#     ).execute()
    
#     if result.data:
#         return [row["content"] for row in result.data]
    
#     # Fallback: fetch all chunks for session if RPC not set up
#     result = supabase.table(TABLE_NAME).select("content").eq("session_id", session_id).limit(top_k).execute()
#     return [row["content"] for row in result.data] if result.data else []

# async def get_all_chunks(session_id: str) -> List[str]:
#     """Get all chunks for a session."""
#     result = supabase.table(TABLE_NAME).select("content").eq("session_id", session_id).execute()
#     return [row["content"] for row in result.data] if result.data else []

# async def delete_session(session_id: str):
#     """Delete all chunks for a session."""
#     supabase.table(TABLE_NAME).delete().eq("session_id", session_id).execute()


import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List
from services.embeddings import get_embedding, get_query_embedding


env_file_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_file_path)

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError(
        f"Supabase credentials missing! Looked for .env at: {env_file_path}\n"
        f"Found SUPABASE_URL: {bool(supabase_url)}, Found SUPABASE_SERVICE_KEY: {bool(supabase_key)}\n"
        "Make sure your backend/.env file has both SUPABASE_URL and SUPABASE_SERVICE_KEY set."
    )

supabase: Client = create_client(supabase_url, supabase_key)
TABLE_NAME = "document_chunks"


async def store_chunks(session_id: str, chunks: List[str], source_type: str = "pdf") -> int:
    """Store text chunks with embeddings in Supabase pgvector."""
    records = []
    for i, chunk in enumerate(chunks):
        # get_embedding is now properly async (see embeddings.py fix)
        embedding = await get_embedding(chunk)
        records.append({
            "session_id": session_id,
            "chunk_index": i,
            "content": chunk,
            "embedding": embedding,
            "source_type": source_type,
        })

    # Upsert in batches of 10 to avoid request size limits
    for i in range(0, len(records), 10):
        batch = records[i : i + 10]
        # Run sync supabase call in thread pool to not block event loop
        await asyncio.to_thread(
            lambda b=batch: supabase.table(TABLE_NAME).upsert(b).execute()
        )

    return len(records)


async def retrieve_relevant_chunks(
    session_id: str, query: str, top_k: int = 5
) -> List[str]:
    """Retrieve the most relevant chunks using vector similarity search."""
    query_embedding = await get_query_embedding(query)

    # Try vector similarity search via RPC
    try:
        result = await asyncio.to_thread(
            lambda: supabase.rpc(
                "match_document_chunks",
                {
                    "query_embedding": query_embedding,
                    "match_session_id": session_id,
                    "match_count": top_k,
                },
            ).execute()
        )
        if result.data:
            return [row["content"] for row in result.data]
    except Exception as e:
        print(f"[vector_store] RPC similarity search failed, using fallback: {e}")

    # Fallback: fetch top chunks ordered by index
    result = await asyncio.to_thread(
        lambda: supabase.table(TABLE_NAME)
        .select("content")
        .eq("session_id", session_id)
        .limit(top_k)
        .execute()
    )
    return [row["content"] for row in result.data] if result.data else []


async def get_all_chunks(session_id: str) -> List[str]:
    """Get all chunks for a session (used by flashcards and quiz)."""
    result = await asyncio.to_thread(
        lambda: supabase.table(TABLE_NAME)
        .select("content")
        .eq("session_id", session_id)
        .execute()
    )
    return [row["content"] for row in result.data] if result.data else []


async def delete_session(session_id: str) -> None:
    """Delete all chunks for a session."""
    await asyncio.to_thread(
        lambda: supabase.table(TABLE_NAME)
        .delete()
        .eq("session_id", session_id)
        .execute()
    )
