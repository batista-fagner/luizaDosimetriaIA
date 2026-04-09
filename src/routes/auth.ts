import { Router, Request, Response } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

// POST /api/auth/validate
router.post('/validate', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email é obrigatório.' });
  }

  const normalized = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from('students')
    .select('email, name, active, role')
    .eq('email', normalized)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: 'Email não autorizado.' });
  }

  if (!data.active) {
    return res.status(403).json({ error: 'Acesso desativado. Entre em contato com o suporte.' });
  }

  return res.json({ email: data.email, name: data.name, role: data.role });
});

export default router;
