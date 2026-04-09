import { Router, Request, Response } from 'express';
import { streamChatCompletion, ChatMessage } from '../services/aiProvider';
import { dailyRateLimit } from '../middleware/rateLimit';
import { registerUsage, saveMessage, getConversationMessages, upsertConversation } from '../services/supabase';

const router = Router();

// POST /api/chat
router.post('/', dailyRateLimit, async (req: Request, res: Response) => {
  const { message, conversationId, studentEmail } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Campo "message" é obrigatório.' });
  }

  if (!conversationId || typeof conversationId !== 'string') {
    return res.status(400).json({ error: 'Campo "conversationId" é obrigatório.' });
  }

  // Configura headers para SSE (Server-Sent Events)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Busca histórico da conversa (se Supabase configurado)
    let history: ChatMessage[] = [];
    try {
      const saved = await getConversationMessages(conversationId);
      history = saved.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    } catch {
      // Supabase não configurado ainda — continua sem histórico
    }

    const messages: ChatMessage[] = [...history, { role: 'user', content: message }];

    // Stream: envia cada token ao frontend via SSE
    const fullReply = await streamChatCompletion(messages, (chunk) => {
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
    });

    // Sinaliza fim do stream
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    // Salva no Supabase em background
    if (studentEmail) {
      const title = message.slice(0, 60);
      Promise.all([
        upsertConversation(conversationId, studentEmail, title).catch(() => {}),
        saveMessage(conversationId, 'user', message).catch(() => {}),
        saveMessage(conversationId, 'assistant', fullReply).catch(() => {}),
        registerUsage(studentEmail, conversationId).catch(() => {}),
      ]);
    }
  } catch (err: unknown) {
    console.error('[chat] Error:', err);
    const msg = err instanceof Error ? err.message : 'Erro interno';
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.end();
  }
});

export default router;
