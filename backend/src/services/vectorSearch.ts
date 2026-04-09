import { loadEmbeddings, generateQueryEmbedding, EmbeddedChunk } from './embeddings';

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function findRelevantChunks(
  query: string,
  topK = 5,
  minScore = 0.6
): Promise<EmbeddedChunk[]> {
  const embeddings = loadEmbeddings();
  if (embeddings.length === 0) return [];

  const queryEmbedding = await generateQueryEmbedding(query);

  const scored = embeddings
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .filter((chunk) => chunk.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

export function buildContextFromChunks(chunks: EmbeddedChunk[]): string {
  if (chunks.length === 0) return '';

  const parts = chunks.map((c) => `[Fonte: ${c.source}]\n${c.text}`);
  return `--- MATERIAL DE REFERÊNCIA ---\n${parts.join('\n\n')}\n--- FIM DO MATERIAL ---`;
}
