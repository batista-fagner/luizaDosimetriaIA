import { Request, Response, NextFunction } from 'express';
import { isWithinDailyLimit } from '../services/supabase';

export async function dailyRateLimit(req: Request, res: Response, next: NextFunction) {
  const studentEmail = req.body?.studentEmail as string | undefined;

  // Se não há email, continua (autenticação será implementada depois)
  if (!studentEmail) {
    return next();
  }

  try {
    const allowed = await isWithinDailyLimit(studentEmail);
    if (!allowed) {
      return res.status(429).json({
        error: 'Limite diário atingido',
        message: 'Você atingiu o limite de 40 consultas por dia. Tente novamente amanhã.',
      });
    }
    next();
  } catch {
    // Se Supabase falhar, não bloqueia o usuário
    next();
  }
}
