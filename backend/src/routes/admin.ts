import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase, getSystemPromptFromDB, saveSystemPromptToDB } from '../services/supabase';
import { invalidatePromptCache, DEFAULT_SYSTEM_PROMPT } from '../services/promptCache';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware: só admin passa
async function requireAdmin(req: Request, res: Response, next: Function) {
  const email = req.headers['x-student-email'] as string;
  if (!email) return res.status(401).json({ error: 'Não autenticado.' });

  const { data } = await supabase
    .from('students')
    .select('role')
    .eq('email', email)
    .single();

  if (data?.role !== 'admin') return res.status(403).json({ error: 'Acesso restrito.' });
  next();
}

// POST /api/admin/import-students
router.post('/import-students', requireAdmin, upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo CSV não enviado.' });

  const csv = req.file.buffer.toString('utf-8');
  const lines = csv.split('\n').map((l) => l.trim()).filter(Boolean);

  // Detecta coluna de email — procura header com "email"
  const header = lines[0].toLowerCase().split(',');
  const emailIdx = header.findIndex((h) => h.includes('email'));
  const nameIdx = header.findIndex((h) => h.includes('nome') || h.includes('name'));

  if (emailIdx === -1) {
    return res.status(400).json({ error: 'Coluna "email" não encontrada no CSV.' });
  }

  const students = lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.replace(/"/g, '').trim());
    return {
      email: cols[emailIdx]?.toLowerCase(),
      name: nameIdx >= 0 ? cols[nameIdx] : null,
    };
  }).filter((s) => s.email && s.email.includes('@'));

  if (students.length === 0) {
    return res.status(400).json({ error: 'Nenhum email válido encontrado no CSV.' });
  }

  const { error } = await supabase.from('students').upsert(
    students.map((s) => ({ ...s, role: 'student', active: true })),
    { onConflict: 'email', ignoreDuplicates: true }
  );

  if (error) return res.status(500).json({ error: 'Erro ao importar alunos.' });

  return res.json({ imported: students.length, students });
});

// GET /api/admin/prompt — retorna o prompt atual (banco ou padrão)
router.get('/prompt', requireAdmin, async (_req: Request, res: Response) => {
  const dbPrompt = await getSystemPromptFromDB();
  return res.json({ prompt: dbPrompt ?? DEFAULT_SYSTEM_PROMPT });
});

// PUT /api/admin/prompt — salva novo prompt e invalida cache
router.put('/prompt', requireAdmin, async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt inválido.' });
  }

  await saveSystemPromptToDB(prompt.trim());
  invalidatePromptCache();
  return res.json({ success: true });
});

export default router;
