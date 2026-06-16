import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { supabase } from '../services/supabase';

const router = Router();

const KIWIFY_SECRET = process.env.KIWIFY_WEBHOOK_SECRET ?? '';

/**
 * Valida a assinatura HMAC-SHA1 que a Kiwify envia no query param `signature`.
 * A assinatura é o HMAC-SHA1 do corpo bruto (raw body) usando o token secreto.
 * Se nenhum secret estiver configurado, a validação é pulada (modo dev/teste).
 */
function isValidSignature(rawBody: string, signature?: string): boolean {
  if (!KIWIFY_SECRET) return true; // sem secret configurado → aceita (apenas para testes)
  if (!signature) return false;

  const expected = crypto
    .createHmac('sha1', KIWIFY_SECRET)
    .update(rawBody)
    .digest('hex');

  // Comparação em tempo constante para evitar timing attacks
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// POST /api/webhooks/kiwify
// Recebe a notificação de venda da Kiwify e cadastra o aluno automaticamente.
router.post('/kiwify', async (req: Request, res: Response) => {
  const rawBody = (req as any).rawBody ?? JSON.stringify(req.body);
  const signature = req.query.signature as string | undefined;

  if (!isValidSignature(rawBody, signature)) {
    console.warn('[Webhook Kiwify] Assinatura inválida — requisição rejeitada.');
    return res.status(401).json({ error: 'Assinatura inválida.' });
  }

  const body = req.body ?? {};

  console.log('[Webhook Kiwify] Payload recebido:', JSON.stringify(body, null, 2));

  const orderStatus: string | undefined = body.order_status;
  const customer = body.Customer ?? body.customer ?? {};

  const email: string | undefined = customer.email?.trim?.()?.toLowerCase();
  const name: string = customer.full_name ?? customer.name ?? '';

  if (!email || !email.includes('@')) {
    console.warn('[Webhook Kiwify] Payload sem email válido.', { orderStatus });
    return res.status(400).json({ error: 'Email não encontrado no payload.' });
  }

  // Venda aprovada → cadastra/ativa o aluno
  if (orderStatus === 'paid') {
    const { error } = await supabase.from('students').upsert(
      { email, name, role: 'student', active: true },
      { onConflict: 'email', ignoreDuplicates: false }
    );

    if (error) {
      console.error('[Webhook Kiwify] Erro ao cadastrar aluno:', error);
      return res.status(500).json({ error: 'Erro ao cadastrar aluno.' });
    }

    console.log(`[Webhook Kiwify] Aluno cadastrado/ativado: ${email}`);
    return res.status(200).json({ message: 'Aluno cadastrado com sucesso.' });
  }

  // Reembolso ou chargeback → desativa o acesso (mantém o registro)
  if (orderStatus === 'refunded' || orderStatus === 'chargedback') {
    const { error } = await supabase
      .from('students')
      .update({ active: false })
      .eq('email', email);

    if (error) {
      console.error('[Webhook Kiwify] Erro ao desativar aluno:', error);
      return res.status(500).json({ error: 'Erro ao desativar aluno.' });
    }

    console.log(`[Webhook Kiwify] Acesso desativado (${orderStatus}): ${email}`);
    return res.status(200).json({ message: 'Acesso desativado.' });
  }

  // Outros status (waiting_payment, refused, etc.) → ignora
  console.log(`[Webhook Kiwify] Evento ignorado (status: ${orderStatus}): ${email}`);
  return res.status(200).json({ message: 'Evento ignorado.' });
});

export default router;
