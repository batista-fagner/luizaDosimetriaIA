import { Router, Request, Response } from 'express';
import { getStudentConversations, getConversationMessages, deleteConversation } from '../services/supabase';

const router = Router();

// GET /api/conversations?email=xxx
router.get('/', async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: 'Email é obrigatório.' });

  try {
    const conversations = await getStudentConversations(email);
    return res.json(conversations);
  } catch {
    return res.status(500).json({ error: 'Erro ao buscar conversas.' });
  }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  try {
    const messages = await getConversationMessages(id);
    return res.json(messages);
  } catch {
    return res.status(500).json({ error: 'Erro ao buscar mensagens.' });
  }
});

// DELETE /api/conversations/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  try {
    await deleteConversation(id);
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Erro ao deletar conversa.' });
  }
});

export default router;
