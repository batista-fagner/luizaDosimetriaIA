import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat';
import syncRouter from './routes/sync';
import authRouter from './routes/auth';
import conversationsRouter from './routes/conversations';
import adminRouter from './routes/admin';
import { getActiveProvider } from './services/aiProvider';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/sync', syncRouter);

app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
  const activeProvider = getActiveProvider();
  console.log(`   IA Provider: ${activeProvider.toUpperCase()} (padrão)`);
  console.log(`   Google API: ${process.env.GOOGLE_API_KEY ? '✓ configurado' : '✗ chave não encontrada'}`);
  console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? '✓ configurado (fallback)' : '✗ chave não encontrada'}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL?.includes('supabase.co') ? '✓ configurado' : '✗ URL não configurada'}`);
});
