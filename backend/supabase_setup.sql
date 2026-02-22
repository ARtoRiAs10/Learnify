-- Enable the pgvector extension
create extension if not exists vector;

-- Create document_chunks table
create table if not exists document_chunks (
  id bigserial primary key,
  session_id text not null,
  chunk_index integer not null,
  content text not null,
  embedding vector(3072),  
  source_type text default 'pdf',
  created_at timestamp with time zone default now()
);

-- Create index for vector similarity search
create index if not exists document_chunks_embedding_idx
  on document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Create index for session_id lookups
create index if not exists document_chunks_session_idx
  on document_chunks (session_id);

-- Create the match function for similarity search
create or replace function match_document_chunks(
  query_embedding vector(768),
  match_session_id text,
  match_count int default 5
)
returns table (
  id bigint,
  session_id text,
  content text,
  chunk_index integer,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.session_id,
    document_chunks.content,
    document_chunks.chunk_index,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where document_chunks.session_id = match_session_id
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Enable Row Level Security (optional but recommended)
alter table document_chunks enable row level security;

-- Policy: Allow all operations (adjust for production)
create policy "Allow all operations" on document_chunks
  for all using (true) with check (true);
