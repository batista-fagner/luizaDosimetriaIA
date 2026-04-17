import OpenAI from 'openai';
import { DocumentChunk, syncDriveDocuments } from './driveSync';
import { supabase } from './supabase';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface EmbeddedChunk extends DocumentChunk {
  embedding: number[];
}

async function generateEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

async function getProcessedSources(): Promise<Set<string>> {
  const { data, error } = await supabase.from('sync_state').select('source');
  if (error) return new Set();
  return new Set((data ?? []).map((r: { source: string }) => r.source));
}

async function saveProcessedSource(source: string): Promise<void> {
  await supabase.from('sync_state').upsert({ source, synced_at: new Date().toISOString() }, { onConflict: 'source' });
}

async function saveChunks(chunks: EmbeddedChunk[]): Promise<void> {
  const rows = chunks.map((c) => ({
    source: c.source,
    chunk_index: c.chunkIndex,
    text: c.text,
    embedding: JSON.stringify(c.embedding),
  }));

  const batchSize = 50;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from('document_chunks').insert(batch);
    if (error) throw error;
  }
}

export async function buildEmbeddings(fileLimit?: number, incrementalOnly = false): Promise<{ total: number; sources: string[]; newChunks: number }> {
  const processedSources = await getProcessedSources();

  let chunks = await syncDriveDocuments(incrementalOnly ? processedSources : undefined);
  const allSources = [...new Set(chunks.map((c) => c.source))];

  if (fileLimit) {
    const sources = allSources.slice(0, fileLimit);
    chunks = chunks.filter((c) => sources.includes(c.source));
    console.log(`[embeddings] Limitado a ${fileLimit} arquivos para teste`);
  }

  if (incrementalOnly) {
    const newSources = new Set(chunks.map((c) => c.source));
    console.log(`[embeddings] Modo incremental: processando apenas ${newSources.size} arquivo(s) novos`);
    if (chunks.length === 0) {
      console.log(`[embeddings] ℹ️ Nenhum arquivo novo encontrado`);
      return { total: 0, sources: [], newChunks: 0 };
    }
  }

  const newChunks = chunks;

  console.log(`[embeddings] Gerando embeddings para ${newChunks.length} chunks...`);

  const embedded: EmbeddedChunk[] = [];
  const newSources = new Set<string>();

  for (let i = 0; i < newChunks.length; i++) {
    const chunk = newChunks[i];
    try {
      const embedding = await generateEmbedding(chunk.text);
      embedded.push({ ...chunk, embedding });
      newSources.add(chunk.source);
      if ((i + 1) % 10 === 0 || i === newChunks.length - 1) {
        console.log(`[embeddings] ${i + 1}/${newChunks.length}`);
      }
    } catch (err) {
      console.error(`[embeddings] Erro no chunk ${i} (${chunk.source}):`, err);
    }
  }

  await saveChunks(embedded);

  for (const source of newSources) {
    await saveProcessedSource(source);
  }

  const { count } = await supabase.from('document_chunks').select('*', { count: 'exact', head: true });
  const total = count ?? embedded.length;

  console.log(`[embeddings] ✅ Salvo: ${total} chunks de ${newSources.size} documentos`);

  return { total, sources: [...newSources], newChunks: newChunks.length };
}

export async function generateQueryEmbedding(text: string): Promise<number[]> {
  return generateEmbedding(text);
}

export async function hasEmbeddings(): Promise<boolean> {
  const { count } = await supabase.from('document_chunks').select('*', { count: 'exact', head: true });
  return (count ?? 0) > 0;
}
