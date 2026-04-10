-- Enable pgvector extension
create extension if not exists vector;

-- Create document_chunks table
create table if not exists document_chunks (
  id bigserial primary key,
  source text not null,
  chunk_index integer not null,
  text text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Index for fast similarity search
create index if not exists document_chunks_embedding_idx
  on document_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Sync state table (tracks which files were already processed)
create table if not exists sync_state (
  source text primary key,
  synced_at timestamptz default now()
);

-- Function for similarity search
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  source text,
  chunk_index integer,
  text text,
  similarity float
)
language sql stable
as $$
  select
    id,
    source,
    chunk_index,
    text,
    1 - (embedding <=> query_embedding) as similarity
  from document_chunks
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
