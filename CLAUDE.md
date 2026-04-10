# IA Dosimetria Penal — Plataforma para Advogada

Plataforma de IA especializada em dosimetria penal para uma advogada com 300 alunos.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite 5 + Tailwind CSS v3
- **Backend:** Node.js + Express + TypeScript + ts-node + nodemon
- **IA (Chat):** Google Gemini 2.5 Flash-Lite com streaming (SSE) — **gratuito**
- **IA (Chat Fallback):** OpenAI GPT-4o Mini
- **Embeddings:** OpenAI `text-embedding-3-small`
- **RAG:** Google Drive + Supabase pgvector (embeddings vetoriais)
- **Database:** Supabase (PostgreSQL) — ✅ Configurado
- **Package manager:** npm (yarn apresentou incompatibilidade com Node 22.0.0)

## Cores do Branding

- **Principal:** `#CAB2A4` (bege rosado)
- **Secundária:** `#846047` (marrom)

## Como Rodar

```bash
# Frontend (porta 5173)
cd ia-dosimetria/frontend
npm run dev

# Backend (porta 3001)
cd ia-dosimetria/backend
npm run dev
```

## Estrutura do Projeto

```
ia-dosimetria/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   │   ├── ChatBox.tsx          # Container do chat com scroll automático
│   │   │   │   ├── InputArea.tsx        # Textarea + botão enviar (Enter para enviar)
│   │   │   │   └── MessageBubble.tsx    # Bubbles user (direita) e IA (esquerda)
│   │   │   └── Layout/
│   │   │       ├── Header.tsx           # Navbar com logo e links
│   │   │       └── Sidebar.tsx          # Sidebar do chat com histórico de conversas
│   │   ├── pages/
│   │   │   ├── HomePage.tsx             # Home com hero + card "Chat Jurídico"
│   │   │   ├── ChatPage.tsx             # Chat com streaming SSE + histórico
│   │   │   └── LoginPage.tsx            # Tela de login por email
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   └── ProtectedRoute.tsx   # Rota protegida (redireciona para login)
│   │   │   └── Admin/
│   │   │       └── ImportModal.tsx      # Modal de importação de CSV (admin only)
│   │   ├── App.tsx                      # BrowserRouter + Routes + ProtectedRoute
│   │   └── index.css                    # Tailwind directives
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── services/
    │   │   ├── aiProvider.ts            # Abstrator de IA (Gemini ou OpenAI)
    │   │   ├── gemini.ts                # Google Gemini 2.5 Flash-Lite + streaming
    │   │   ├── openai.ts                # OpenAI GPT-4o Mini (fallback)
    │   │   ├── driveSync.ts             # Sincroniza Google Drive, extrai PDF/DOCX/Docs
    │   │   ├── embeddings.ts            # Gera embeddings via OpenAI, salva em JSON
    │   │   ├── vectorSearch.ts          # Busca vetorial (cosine similarity)
    │   │   └── supabase.ts              # Histórico, conversas, alunos, rate limit
    │   ├── middleware/
    │   │   └── rateLimit.ts             # 40 consultas/dia por aluno
    │   ├── routes/
    │   │   ├── auth.ts                  # POST /api/auth/validate (login por email)
    │   │   ├── chat.ts                  # POST /api/chat (SSE streaming com RAG)
    │   │   ├── conversations.ts         # GET /api/conversations (histórico)
    │   │   ├── admin.ts                 # POST /api/admin/import-students (CSV upload)
    │   │   └── sync.ts                  # POST /api/sync (sincroniza Drive)
    │   └── index.ts                     # Express server + CORS
    ├── credentials/
    │   └── google-service-account.json  # Service Account do Google Drive
    ├── data/
    │   ├── embeddings.json              # Chunks + embeddings salvos localmente
    │   └── sync-state.json              # Rastreamento de arquivos processados
    ├── .env                             # Chaves (não commitar)
    ├── .env.example                     # Modelo das variáveis
    ├── .gitignore                       # Exclui credentials/ e data/
    └── package.json
```

## Variáveis de Ambiente (backend/.env)

```env
# IA Provider (padrão: gemini, fallback: openai)
AI_PROVIDER=gemini

# Google Generative AI (Gemini) — ✅ Configurado, gratuito
GOOGLE_API_KEY=AIza...

# OpenAI (para embeddings + fallback) — ✅ Configurado
OPENAI_API_KEY=sk-...

# Supabase (histórico + rate limit) — ✅ Configurado
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
DATABASE_URL='postgresql://postgres:SENHA@db.xxxxx.supabase.co:5432/postgres'

PORT=3001
```

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check |
| POST | `/api/auth/validate` | Valida email e retorna role |
| POST | `/api/chat` | Chat com streaming SSE + RAG |
| GET | `/api/conversations` | Lista conversas do aluno |
| GET | `/api/conversations/:id/messages` | Carrega mensagens de uma conversa |
| POST | `/api/admin/import-students` | Importa alunos via CSV (admin only) |
| POST | `/api/sync` | Sincroniza Google Drive e gera embeddings |
| GET | `/api/sync/status` | Verifica se embeddings existem |

### POST /api/auth/validate
Valida email e retorna role (student/admin).

Body:
```json
{
  "email": "aluno@example.com"
}
```
Resposta:
```json
{
  "email": "aluno@example.com",
  "name": "Nome do Aluno",
  "role": "student"
}
```

### POST /api/chat
Chat com streaming SSE + RAG.

Body:
```json
{
  "message": "string",
  "conversationId": "string",
  "studentEmail": "string"
}
```
Resposta: SSE streaming com tokens da IA

### GET /api/conversations?email=aluno@example.com
Lista conversas do aluno.

Resposta:
```json
[
  {
    "id": "1712345678900",
    "title": "Qual é o cálculo da pena no...",
    "created_at": "2026-04-08T10:30:00Z"
  }
]
```

### POST /api/admin/import-students
Importa alunos via CSV (requer header `x-student-email` de admin).

Headers:
```
x-student-email: admin@example.com
```

Body (multipart/form-data):
```
file: students.csv
```

O CSV deve ter coluna `email` (e opcionalmente `nome`):
```
email,nome
aluno1@example.com,João Silva
aluno2@example.com,Maria Santos
```

Resposta:
```json
{
  "imported": 2,
  "students": [
    { "email": "aluno1@example.com", "name": "João Silva" },
    { "email": "aluno2@example.com", "name": "Maria Santos" }
  ]
}
```

### POST /api/sync
Sincronização completa ou incremental com Google Drive.

Body (opcional):
```json
{
  "fileLimit": 4,        // (opcional) limita quantidade de arquivos para teste
  "incremental": true    // (opcional) processa apenas novos arquivos
}
```
Exemplo — sincronizar apenas 4 primeiros arquivos:
```bash
curl -X POST http://localhost:3001/api/sync \
  -H "Content-Type: application/json" \
  -d '{"fileLimit": 4}'
```

Exemplo — sincronizar apenas novos (incremental):
```bash
curl -X POST http://localhost:3001/api/sync \
  -H "Content-Type: application/json" \
  -d '{"incremental": true}'
```

---

## ✅ O que foi feito

### Frontend
- [x] Estrutura React + Vite + TypeScript + Tailwind v3
- [x] Roteamento com React Router (Home → Chat → Login)
- [x] `HomePage` — hero com gradiente + padrão geométrico CSS + card "Chat Jurídico"
- [x] `ChatPage` — sidebar com histórico + área do chat + input
- [x] `LoginPage` — tela de autenticação por email com espaço para logo
- [x] `ProtectedRoute` — redireciona para login se não autenticado
- [x] Sidebar com botão "Nova conversa" e lista de conversas com data/hora
- [x] Mensagens do usuário (balão direita) e IA (texto esquerda) com formatação markdown
- [x] Input com textarea, envio por Enter ou botão
- [x] Indicador "Pensando..." com spinner durante loading
- [x] **Streaming SSE** — resposta aparece sendo "digitada" em tempo real
- [x] Exibição de erros inline
- [x] Footer com termos de uso
- [x] Cores do branding da advogada aplicadas
- [x] Header com nome/email do aluno + botão "Sair"
- [x] Admin panel — botão "Importar alunos" (CSV upload) no header para admins
- [x] Modal de importação com preview dos alunos e confirmação
- [x] Histórico de conversas carregado do Supabase ao entrar
- [x] Mensagens carregadas do banco ao selecionar conversa anterior

### Backend
- [x] Express + CORS + TypeScript
- [x] Rota POST `/api/auth/validate` — validação por email
- [x] Rota POST `/api/chat` com **streaming SSE**
- [x] Rota GET `/api/conversations` — lista conversas do aluno
- [x] Rota GET `/api/conversations/:id/messages` — carrega mensagens
- [x] Rota POST `/api/admin/import-students` — importa CSV (admin only)
- [x] **IA Provider** com suporte a múltiplos modelos:
  - [x] Google Gemini 2.5 Flash-Lite (padrão, gratuito)
  - [x] OpenAI GPT-4o Mini (fallback)
- [x] System prompt especializado em dosimetria penal com formatação clara
  - [x] Duplo espaçamento entre parágrafos
  - [x] Separadores `---` entre seções
  - [x] Títulos `##` e `###` para organização
- [x] **Google Drive Sync (RAG):**
  - [x] Sincronização automática de arquivos do Drive
  - [x] Suporte a múltiplos formatos: PDF, Google Docs, DOCX, TXT
  - [x] Resolução de atalhos (shortcuts)
  - [x] Divisão de documentos em chunks (800 caracteres com overlap)
- [x] **Embeddings & Busca Vetorial:**
  - [x] Geração de embeddings com OpenAI `text-embedding-3-small`
  - [x] Armazenamento local em JSON
  - [x] Busca por similaridade (cosine similarity)
  - [x] Integração automática ao chat (RAG)
- [x] **Supabase — Banco de Dados:**
  - [x] Tabela `students` — alunos com email, nome, role (student/admin), ativo
  - [x] Tabela `conversations` — conversas por aluno com título e data
  - [x] Tabela `messages` — histórico de mensagens (user/assistant)
  - [x] Tabela `usage` — rastreamento de consultas diárias por aluno
  - [x] Índices para performance
- [x] **Rate Limit:**
  - [x] 40 consultas/dia por aluno
  - [x] Contador diário automático (reseta à meia-noite)
  - [x] Valida via `studentEmail` no request
- [x] **Autenticação por Email:**
  - [x] Validação contra lista de alunos no Supabase
  - [x] Roles: `student` (padrão) ou `admin`
  - [x] Campo `active` para ativar/desativar acesso sem deletar
  - [x] `studentEmail` persistido no localStorage
- [x] **Histórico de Conversas:**
  - [x] Salva título (primeiras 60 chars da mensagem) automaticamente
  - [x] Carrega histórico ao entrar no chat
  - [x] Exibe conversas anteriores na sidebar
  - [x] Ao clicar em conversa, carrega as mensagens do Supabase
- [x] **Importação de Alunos (CSV):**
  - [x] Endpoint protegido (admin only)
  - [x] Parse automático de CSV com coluna "email"
  - [x] Validação e limpeza de emails
  - [x] Upsert inteligente (atualiza ou cria)
  - [x] Preview e confirmação no frontend
- [x] **Correção do Gemini:**
  - [x] Sanitiza histórico para começar com 'user' (requisito do Gemini)
  - [x] Suporta histórico carregado do Supabase sem erros
- [x] Rota POST `/api/sync` com suporte a teste (fileLimit)
- [x] Health check `/health`
- [x] `.env.example` documentado
- [x] `.gitignore` criado (exclui credentials/ e data/)
- [x] Scripts de setup:
  - [x] `npm run setup-db` — cria tabelas e índices
  - [x] `npm run add-student -- email nome` — adiciona aluno único
- [x] Sincronização Inteligente:
  - [x] Sincronização completa (reprocessa tudo)
  - [x] Sincronização incremental (apenas novos)
  - [x] Rastreamento de estado em `sync-state.json`

---

## URLs de Produção

- **Frontend (Vercel):** https://luiza-dosimetria-ia.vercel.app
- **Backend (Railway):** https://luizadosimetriaia-production.up.railway.app
- **Repositório:** https://github.com/batista-fagner/luizaDosimetriaIA

## ⏳ O que falta

### Prioridade alta
- [x] **Imagens do cliente** (logo e background)
  - [x] Logo `Logo_dourada.svg` para LoginPage (implementada)
  - [x] Logo para favicon
  - [x] Logo para Header
- [x] **Deploy** (Railway para backend + Vercel para frontend)
  - [x] Configurar variáveis de ambiente no Railway/Vercel
  - [x] Atualizar CORS no backend com URL de produção
  - [x] Atualizar API_URL no frontend para produção
  - [x] Ambiente de dev em localhost e prod em Railway/Vercel

### Prioridade média
- [ ] **Webhook da Kiwify** (automático, não dependência crítica)
  - Receber notificação a cada compra
  - Adicionar aluno automaticamente
  - Ativar acesso na hora
- [ ] **Dashboard admin** (futuro)
  - Ver quantas consultas cada aluno fez
  - Filtrar por data
  - Exportar relatório de uso
  - Estatísticas de uso
- [x] **Migrar para Supabase pgvector** (otimização, embeddings no banco)
  - [x] Tabela `document_chunks` com extensão pgvector
  - [x] Tabela `sync_state` para rastreamento de sincronizações
  - [x] Função SQL `match_documents()` para busca vetorial via pgvector
  - [x] 82 chunks de 5 documentos sincronizados e operacionais

### Prioridade baixa
- [ ] **Webhook para sincronização automática do Drive** (caso novos docs sejam adicionados)
- [ ] **Modo dark** na plataforma
- [ ] **Suporte a múltiplas idiomas**

---

## Decisões Técnicas Importantes

- **Tailwind v3** (não v4): o v4 tem configuração incompatível com o setup atual e gerava CSS incompleto
- **npm** (não yarn): yarn 1.x é incompatível com Node 22.0.0 por restrições de engine
- **SSE** (não WebSocket): mais simples para streaming unidirecional (servidor → cliente)
- **Google Gemini** (default) **vs OpenAI** (fallback): Gemini é gratuito no free tier (1.500 req/min), OpenAI é fallback garantido
- **PDF Parse v1.1.1** (não v2): v2 tem incompatibilidade com Node (DOMMatrix)
- **Embeddings em Supabase pgvector** — Armazenamento vetorial nativo. Permite sincronização incremental com rastreamento em `sync_state`. Escalável para milhares de documentos.
- **Busca vetorial via pgvector**: extensão nativa do PostgreSQL com operador `<=>` (cosine distance)
- **Sincronização incremental**: rastreia arquivos processados em `sync_state`, reprocessa apenas novos (economia de tokens/custos)
- **RAG via Supabase pgvector**: implementado e operacional. Credenciais do Google armazenadas como variável de ambiente (base64) no Railway
- **Autenticação por email**: simples (sem OAuth), validado contra tabela `students` no Supabase. Sem verificação de 2FA.
- **CSV em vez de Webhook Kiwify**: mais simples para entrega inicial. Cliente exporta CSV e sobe via admin panel.
- **Rate limit localStorage**: verificação de email no request, contador diário reseta à meia-noite automático no Supabase
- **Admin via role**: usuário pode ter `role: 'admin'` ou `'student'`. Simples, sem permissões granulares.
- **Histórico local JSON + Supabase**: chat atual usa Supabase, histórico antigo em JSON ainda disponível
- **Multer para upload CSV**: simples e nativo, sem depender de cloud storage separado

## Formatação das Respostas da IA

O prompt do Gemini/OpenAI foi otimizado para melhor legibilidade:

**Frontend (MessageBubble.tsx):**
- Usa `ReactMarkdown` para renderizar markdown
- Estiliza `<hr>` (---) com cor do branding e margem adequada
- Parágrafos (`<p>`) com `mb-4` para espaçamento visual

**Backend (gemini.ts / openai.ts):**
```
FORMATAÇÃO (obrigatório):
- Separe parágrafos com DUAS linhas em branco (três quebras de linha).
- Entre seções ou blocos temáticos distintos, insira uma linha separadora: ---
- Use títulos com ## ou ### para organizar seções longas.
```

Resultado: respostas bem organizadas, fáceis de ler, com separadores visuais claros.

---

## Setup do Google Drive + Embeddings

### 1. Google Cloud — Credenciais
1. Acesse https://console.cloud.google.com/
2. Crie um projeto
3. Ative **Google Drive API**
4. Crie um **Service Account**
5. Baixe o arquivo JSON e salve em `backend/credentials/google-service-account.json`
6. Compartilhe a pasta do Drive com o email do Service Account (Leitor)

### 2. Sincronização (primeira vez)
```bash
curl -X POST http://localhost:3001/api/sync
```
Resultado: `data/embeddings.json` + `data/sync-state.json`

### 3. Sincronização (novos arquivos)
Quando novos arquivos forem adicionados ao Drive:
```bash
curl -X POST http://localhost:3001/api/sync \
  -H "Content-Type: application/json" \
  -d '{"incremental": true}'
```
Processa apenas novos, sem reprocessar os antigos.

---

## Entrega ao Cliente

Quando pronto para entrega, envie ao cliente:

1. **Documento: SETUP_CLIENTE.md**
   - Instruções passo-a-passo para configurar Supabase, Google APIs
   - Lista de credenciais necessárias
   - Checklist de verificação

2. **Código do Repositório**
   - Frontend em `/ia-dosimetria/frontend`
   - Backend em `/ia-dosimetria/backend`
   - `.env.example` com variáveis
   - Scripts prontos (`npm run setup-db`, `npm run add-student`)

3. **Primeira Configuração**
   - Cliente cria conta no Supabase, pega credenciais
   - Cliente gera API keys (Google, OpenAI)
   - Cliente configura `.env` com suas credenciais
   - Cliente roda `npm run setup-db` para criar tabelas
   - Cliente adiciona seu email como admin
   - Cliente importa CSV de alunos via admin panel

4. **Deploy (Opcional)**
   - Backend: Railway, Render ou Heroku
   - Frontend: Vercel, Netlify ou mesmo Railway
   - Atualizar CORS no backend
   - Atualizar API_URL no frontend

---

## Ambientes

### Desenvolvimento (localhost)
```bash
# Terminal 1 - Frontend
cd frontend && npm run dev
# Acessa: http://localhost:5173
# API: http://localhost:3001

# Terminal 2 - Backend
cd backend && npm run dev
# Servidor: http://localhost:3001
```

Usa `.env.development` com `VITE_API_URL=http://localhost:3001`

### Produção (Railway + Vercel)
- **Frontend:** Vercel → https://luiza-dosimetria-ia.vercel.app
- **Backend:** Railway → https://luizadosimetriaia-production.up.railway.app
- **Variáveis Railway:**
  - `GOOGLE_SERVICE_ACCOUNT_B64` — credencial do Google (base64, no ambiente)
  - `FRONTEND_URL` — URL do frontend para CORS (`https://luiza-dosimetria-ia.vercel.app`)
  - Demais variáveis: `AI_PROVIDER`, `GOOGLE_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`

Deploy automático: push em `main` → GitHub webhook → Vercel/Railway redeploy

---

## Logs de Mudanças

### 2026-04-10 — Migração para pgvector e Deploy em Produção
- ✅ Migração de embeddings: JSON → Supabase pgvector
  - Criou tabelas `document_chunks` + `sync_state`
  - Função SQL `match_documents()` para busca vetorial
  - 82 chunks de 5 documentos sincronizados
- ✅ Deploy completo em produção
  - Frontend: Vercel (CI/CD automático via GitHub)
  - Backend: Railway ($5/mês Hobby plan, suficiente para 300 alunos)
  - Credenciais do Google: armazenadas como variável de ambiente (base64)
  - CORS dinâmico: localhost + produção
  - Environment variables: `.env.development` (dev) e `.env.production` (prod)
- ✅ Testes em produção: RAG, autenticação, histórico funcionando

### 2026-04-09 — Logo e Configuração de Deploy
- ✅ Logo `Logo_dourada.svg` adicionada
  - LoginPage (sem círculo)
  - Favicon
- ✅ Configuração Vercel
  - `vercel.json` com rewrite para SPA
  - Variáveis de ambiente por ambiente
- ✅ Configuração Railway
  - `railway.json` (build + start commands)
  - Dockerfile com Node.js alpine
  - Root directory: `ia-dosimetria/backend`

### 2026-04-08 — Inicial
- ✅ Melhorias no formatação do prompt (espaçamento duplo, separadores)
- ✅ Supabase full setup (4 tabelas + índices)
- ✅ Autenticação por email com role (student/admin)
- ✅ Rate limit 40 req/dia por aluno
- ✅ Histórico persistido (conversas + mensagens)
- ✅ Tela de login com logo
- ✅ Botão logout no header
- ✅ Admin panel: importação de CSV de alunos
- ✅ Correção de erro do Gemini com histórico
- ✅ Scripts de setup (`setup-db`, `add-student`)
- ✅ Documento de setup para cliente (SETUP_CLIENTE.md)

### Custos de Infraestrutura

**Production:**
- **Vercel (Frontend):** **GRATUITO** (plano Hobby)
  - Deploy automático via GitHub
  - Domínio customizado + SSL
  - Builds ilimitados
  
- **Railway (Backend):** **$5/mês** (Hobby plan)
  - Inclui $5 de crédito mensal
  - ~$2.50/mês de consumo real (vCPU + RAM)
  - Suporta 300 alunos × 40 req/dia sem problemas
  - 7-day log history

- **Supabase (Database):** **GRATUITO** (free tier)
  - 500 MB storage (suficiente para histórico + embeddings)
  - Unlimited API calls
  - pgvector nativo incluído

**APIs (custos recorrentes):**
- **Google Gemini:** **GRATUITO** (1.500 req/min free tier)
  - 300 alunos × 40 req/dia = ~12.000 req/dia (bem abaixo do limite)
  
- **OpenAI (Embeddings):** ~**$1-2/mês**
  - `text-embedding-3-small`: $0.02 por 1M tokens
  - Sync inicial: ~$0.02 (único)
  - Busca no chat: ~$0.0001 por pergunta

**Total mensal: ~$6-7/mês** (Railway + OpenAI embeddings)

Para cliente: **R$6.000 inicial** + **R$300-500/mês manutenção**
