import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentChunk, syncDriveDocuments } from './driveSync';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const DATA_PATH = path.join(__dirname, '../../data/embeddings.json');
const STATE_PATH = path.join(__dirname, '../../data/sync-state.json');

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

function loadState(): Set<string> {
  if (!fs.existsSync(STATE_PATH)) return new Set();
  try {
    const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
    return new Set(state.processedSources || []);
  } catch {
    return new Set();
  }
}

function saveState(sources: Set<string>): void {
  const dir = path.dirname(STATE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify({ processedSources: [...sources] }, null, 2));
}

export async function buildEmbeddings(fileLimit?: number, incrementalOnly = false): Promise<{ total: number; sources: string[]; newChunks: number }> {
  let chunks = await syncDriveDocuments();

  const processedSources = loadState();
  const allSources = [...new Set(chunks.map((c) => c.source))];

  if (fileLimit) {
    const sources = allSources.slice(0, fileLimit);
    chunks = chunks.filter((c) => sources.includes(c.source));
    console.log(`[embeddings] Limitado a ${fileLimit} arquivos para teste`);
  }

  let newChunks = chunks;
  let newSources = new Set(allSources);

  if (incrementalOnly) {
    newChunks = chunks.filter((c) => !processedSources.has(c.source));
    newSources = new Set(newChunks.map((c) => c.source));
    console.log(`[embeddings] Modo incremental: processando apenas ${newSources.size} arquivo(s) novos`);
    if (newChunks.length === 0) {
      console.log(`[embeddings] ℹ️ Nenhum arquivo novo encontrado`);
      return { total: 0, sources: [], newChunks: 0 };
    }
  }

  console.log(`[embeddings] Gerando embeddings para ${newChunks.length} chunks...`);

  const existingEmbeddings: EmbeddedChunk[] = incrementalOnly ? loadEmbeddings() : [];
  const embedded: EmbeddedChunk[] = incrementalOnly ? existingEmbeddings : [];
  const sources = incrementalOnly ? new Set(processedSources) : new Set<string>();

  for (let i = 0; i < newChunks.length; i++) {
    const chunk = newChunks[i];
    try {
      const embedding = await generateEmbedding(chunk.text);
      embedded.push({ ...chunk, embedding });
      sources.add(chunk.source);
      if ((i + 1) % 10 === 0 || i === newChunks.length - 1) {
        console.log(`[embeddings] ${i + 1}/${newChunks.length}`);
      }
    } catch (err) {
      console.error(`[embeddings] Erro no chunk ${i} (${chunk.source}):`, err);
    }
  }

  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(embedded, null, 2));
  saveState(sources);

  console.log(`[embeddings] ✅ Salvo: ${embedded.length} chunks de ${sources.size} documentos`);

  return { total: embedded.length, sources: [...sources], newChunks: newChunks.length };
}

export async function generateQueryEmbedding(text: string): Promise<number[]> {
  return generateEmbedding(text);
}

export function loadEmbeddings(): EmbeddedChunk[] {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

export function hasEmbeddings(): boolean {
  return fs.existsSync(DATA_PATH);
}
