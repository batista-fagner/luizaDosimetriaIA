import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

const FOLDER_ID = '1Ph8E2tfFJn4SiUl8QvhShX6IEKhuyA8p';
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials/google-service-account.json');

function getAuthClient() {
  let b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (b64) {
    // Remove quotes and all whitespace
    b64 = b64.replace(/^"|"$/g, '').replace(/[\s\n\r\t]+/g, '');
    console.log('[drive] Base64 length:', b64.length);
    try {
      const decoded = Buffer.from(b64, 'base64').toString('utf-8');
      const credentials = JSON.parse(decoded);
      console.log('[drive] Credentials loaded successfully');
      return new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });
    } catch (err) {
      console.error('[drive] Failed to parse credentials:', err);
      throw err;
    }
  }
  return new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

export interface DocumentChunk {
  text: string;
  source: string;
  chunkIndex: number;
}

function cleanMarkdown(text: string): string {
  // Remove markdown formatting: **bold** → bold, * items → items, etc.
  return text
    .replace(/\*\*/g, '') // Remove **bold**
    .replace(/\*/g, '')   // Remove * bullets/italic
    .replace(/__/g, '')   // Remove __bold__
    .replace(/_/g, '')    // Remove _italic_
    .replace(/`/g, '');   // Remove `code`
}

function chunkText(text: string, source: string, chunkSize = 800, overlap = 100): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 50) {
      chunks.push({ text: chunk, source, chunkIndex: index++ });
    }
    start += chunkSize - overlap;
  }

  return chunks;
}

async function extractText(
  fileId: string,
  mimeType: string,
  name: string,
  drive: ReturnType<typeof google.drive>
): Promise<string> {
  try {
    let text = '';

    if (mimeType === 'application/vnd.google-apps.document') {
      const res = await drive.files.export(
        { fileId, mimeType: 'text/plain' },
        { responseType: 'text' }
      );
      text = res.data as string;
    } else if (mimeType === 'application/pdf') {
      const res = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      const buffer = Buffer.from(res.data as ArrayBuffer);
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const res = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      const buffer = Buffer.from(res.data as ArrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (mimeType === 'text/plain') {
      const res = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'text' }
      );
      text = res.data as string;
    } else {
      console.log(`[drive] Tipo não suportado: ${mimeType} (${name})`);
      return '';
    }

    return cleanMarkdown(text);
  } catch (err) {
    console.error(`[drive] Erro ao extrair texto de ${name}:`, err);
    return '';
  }
}

export async function syncDriveDocuments(): Promise<DocumentChunk[]> {
  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  console.log('[drive] Listando arquivos...');

  const res = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, shortcutDetails)',
    pageSize: 100,
  });

  const files = res.data.files || [];
  console.log(`[drive] ${files.length} arquivos encontrados`);

  const allChunks: DocumentChunk[] = [];

  for (const file of files) {
    if (!file.id || !file.mimeType || !file.name) continue;

    let fileId = file.id;
    let mimeType = file.mimeType;

    // Resolve atalhos (shortcuts) para o arquivo real
    if (mimeType === 'application/vnd.google-apps.shortcut') {
      const targetId = file.shortcutDetails?.targetId;
      const targetMime = file.shortcutDetails?.targetMimeType;
      if (!targetId || !targetMime) {
        console.log(`[drive] Atalho sem destino: ${file.name}`);
        continue;
      }
      fileId = targetId;
      mimeType = targetMime;
      console.log(`[drive] Atalho resolvido: ${file.name} → ${targetMime}`);
    }

    console.log(`[drive] Processando: ${file.name} (${mimeType})`);
    const text = await extractText(fileId, mimeType, file.name, drive);

    if (text.trim().length > 0) {
      const chunks = chunkText(text, file.name);
      allChunks.push(...chunks);
      console.log(`[drive] "${file.name}": ${chunks.length} chunks`);
    }
  }

  return allChunks;
}
