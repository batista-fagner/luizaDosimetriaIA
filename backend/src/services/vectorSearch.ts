import { generateQueryEmbedding, EmbeddedChunk } from './embeddings';
import { supabase } from './supabase';

export async function findRelevantChunks(
  query: string,
  topK = 5,
  minScore = 0.6
): Promise<EmbeddedChunk[]> {
  const queryEmbedding = await generateQueryEmbedding(query);

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: minScore,
    match_count: topK,
  });

  if (error) {
    console.error('[vectorSearch] Erro na busca:', error);
    return [];
  }

  return (data ?? []).map((row: { source: string; chunk_index: number; text: string; similarity: number }) => ({
    source: row.source,
    chunkIndex: row.chunk_index,
    text: row.text,
    embedding: [],
    score: row.similarity,
  }));
}

export function buildContextFromChunks(chunks: EmbeddedChunk[]): string {
  if (chunks.length === 0) return '';

  const parts = chunks.map((c) => `[Fonte: ${c.source}]\n${c.text}`);
  return `--- MATERIAL DE REFERÊNCIA ---\n${parts.join('\n\n')}\n--- FIM DO MATERIAL ---`;
}
