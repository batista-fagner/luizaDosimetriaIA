import { Router, Request, Response } from 'express';
import { buildEmbeddings, hasEmbeddings } from '../services/embeddings';

const router = Router();

// POST /api/sync — sincroniza documentos do Google Drive e gera embeddings
router.post('/', async (req: Request, res: Response) => {
  const fileLimit = req.body?.fileLimit ? Number(req.body.fileLimit) : undefined;
  const incremental = req.body?.incremental === true;
  console.log(`[sync] Iniciando sincronização com Google Drive...${incremental ? ' (apenas novos)' : ''}${fileLimit ? ` (limite: ${fileLimit} arquivos)` : ''}`);
  try {
    const result = await buildEmbeddings(fileLimit, incremental);
    res.json({
      ok: true,
      message: `Sincronização concluída: ${result.total} chunks de ${result.sources.length} documentos${incremental ? ` (${result.newChunks} chunks novos)` : ''}`,
      sources: result.sources,
      total: result.total,
      newChunks: result.newChunks,
    });
  } catch (err: unknown) {
    console.error('[sync] Erro:', err);
    const msg = err instanceof Error ? err.message : 'Erro interno';
    res.status(500).json({ ok: false, error: msg });
  }
});

// GET /api/sync/status — verifica se os embeddings existem
router.get('/status', (_req: Request, res: Response) => {
  res.json({ ready: hasEmbeddings() });
});

export default router;
