# Setup para Entrega ao Cliente

Documento com todas as configurações e credenciais que a cliente precisa providenciar para usar a plataforma.

---

## 1. Supabase (Banco de Dados)

**O que é:** Banco de dados PostgreSQL para armazenar alunos, histórico de conversas e controle de uso.

**Como configurar:**
1. Acesse [supabase.com](https://supabase.com)
2. Faça login com GitHub ou crie conta
3. Clique em **"New Project"**
4. Preencha:
   - **Name:** `ia-dosimetria` (ou similar)
   - **Database Password:** defina uma senha forte e anote
   - **Region:** `South America (São Paulo)` (menor latência)
5. Aguarde ~2 minutos para o projeto inicializar

**Credenciais necessárias:**
- Vá em **Settings → API**
- Copie:
  - `SUPABASE_URL` → será `https://xxxxx.supabase.co`
  - `SUPABASE_ANON_KEY` → será `eyJ...`
  - `DATABASE_URL` → será `postgresql://postgres:SENHA@db.xxxxx.supabase.co:5432/postgres`
    - Substitua `SENHA` pela senha definida acima
    - Codifique `#` como `%23` se houver caracters especiais
    - Coloque entre aspas simples: `'postgresql://...'`

**Arquivo a atualizar:** `backend/.env`
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
DATABASE_URL='postgresql://postgres:SENHA@db.xxxxx.supabase.co:5432/postgres'
```

---

## 2. Google Generative AI (Gemini - IA gratuita)

**O que é:** Modelo de IA para gerar respostas do chat jurídico. Free tier: 1.500 req/min.

**Como configurar:**
1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Clique em **"Create API Key"**
3. Selecione o projeto (ou crie um novo)
4. Copie a chave gerada

**Arquivo a atualizar:** `backend/.env`
```env
GOOGLE_API_KEY=AIza...
```

---

## 3. OpenAI API (GPT-4o Mini para embeddings)

**O que é:** Usado para gerar embeddings dos documentos do Google Drive (busca semântica). Custo: ~$0.02 por 1M tokens.

**Como configurar:**
1. Acesse [OpenAI Platform](https://platform.openai.com)
2. Vá em **API keys → Create new secret key**
3. Copie a chave

**Arquivo a atualizar:** `backend/.env`
```env
OPENAI_API_KEY=sk-...
```

---

## 4. Google Drive + Service Account (RAG)

**O que é:** Integração com Google Drive para sincronizar documentos jurídicos automaticamente.

**Como configurar:**
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto (ou use existente)
3. Ative **Google Drive API**:
   - Busque por "Google Drive API"
   - Clique em "Enable"
4. Crie uma **Service Account**:
   - Vá em **IAM & Admin → Service Accounts**
   - Clique em **Create Service Account**
   - Nome: `ia-dosimetria-sync`
   - Clique em **Create and Continue**
5. Gere uma chave JSON:
   - Na aba **Keys**, clique em **Add Key → Create new key**
   - Selecione **JSON**
   - Será baixado um arquivo `*.json`
6. Salve em `backend/credentials/google-service-account.json`
7. **Compartilhe a pasta do Drive** com o email do Service Account (role: **Leitor**)
   - O email está dentro do arquivo JSON baixado (campo `client_email`)

---

## 5. Frontend - URLs de API

Se a plataforma for fazer deploy:
- Altere `http://localhost:3001` para a URL do backend em produção

**Arquivo a atualizar:** `frontend/src/pages/ChatPage.tsx`, `LoginPage.tsx`, etc.
```tsx
const API_URL = 'https://seu-backend.com'; // em vez de http://localhost:3001
```

---

## 6. CORS - Configurar origem permitida

Se fizer deploy, o backend precisa saber de onde virão as requisições.

**Arquivo a atualizar:** `backend/src/index.ts`
```ts
app.use(cors({ origin: 'https://seu-frontend.com' })); // em vez de http://localhost:5173
```

---

## Checklist de Configuração

- [ ] Supabase criado e credenciais em `backend/.env`
- [ ] Google Gemini API key em `backend/.env`
- [ ] OpenAI API key em `backend/.env`
- [ ] Service Account JSON em `backend/credentials/google-service-account.json`
- [ ] Pasta do Google Drive compartilhada com o Service Account
- [ ] Primeiro login com email admin para ativar a plataforma
- [ ] CSV dos alunos importado via botão "Importar alunos"
- [ ] (Opcional) Deploy do frontend e backend
- [ ] (Opcional) URLs de API atualizadas para produção

---

## Primeiro Uso

1. **Sincronizar documentos do Drive:**
   ```bash
   curl -X POST http://localhost:3001/api/sync
   ```

2. **Login com email admin:**
   - Usar email cadastrado como admin no Supabase

3. **Importar alunos:**
   - Exportar CSV da Kiwify com emails dos compradores
   - Clicar em "Importar alunos" no header
   - Fazer upload do CSV

4. **Testar o chat:**
   - Entrar com email de aluno
   - Conversar normalmente
   - As respostas vêm do Gemini com contexto dos documentos

---

## Suporte

Qualquer dúvida nas configurações, abrir issue ou entrar em contato.
