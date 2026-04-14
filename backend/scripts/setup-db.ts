import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SQL = `
-- Extensão pgvector para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Conversas por aluno
CREATE TABLE IF NOT EXISTS conversations (
  id text PRIMARY KEY,
  student_email text NOT NULL,
  title text NOT NULL DEFAULT 'Nova conversa',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversations_email_idx ON conversations (student_email, created_at DESC);

-- Lista de alunos autorizados
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS students_email_idx ON students (email);

-- Uso diário por aluno
CREATE TABLE IF NOT EXISTS usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email text NOT NULL,
  conversation_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Mensagens do chat
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Configurações do sistema (ex: prompt da IA)
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Chunks de documentos com embeddings (para RAG)
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  chunk_index integer NOT NULL,
  text text NOT NULL,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS document_chunks_source_idx ON document_chunks (source);

-- Rastreamento de sincronizações
CREATE TABLE IF NOT EXISTS sync_state (
  source text PRIMARY KEY,
  synced_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS usage_email_date_idx ON usage (student_email, created_at);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages (conversation_id, created_at);
`;

async function main() {
  const url = process.env.DATABASE_URL;
  console.log('DATABASE_URL carregada?', url ? `Sim (começa com: ${url.slice(0, 30)}...)` : 'NÃO — variável indefinida');

  const client = new Client({ connectionString: url });

  try {
    console.log('Conectando ao Supabase...');
    await client.connect();

    console.log('Criando tabelas...');
    await client.query(SQL);

    console.log('✅ Banco configurado com sucesso!');
    console.log('   - Tabela: conversations');
    console.log('   - Tabela: students');
    console.log('   - Tabela: usage');
    console.log('   - Tabela: messages');
    console.log('   - Tabela: settings');
    console.log('   - Tabela: document_chunks (para RAG)');
    console.log('   - Tabela: sync_state (rastreamento)');
    console.log('   - Extensão: pgvector');
    console.log('   - Índices criados');
  } catch (err) {
    console.error('❌ Erro ao configurar banco:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
