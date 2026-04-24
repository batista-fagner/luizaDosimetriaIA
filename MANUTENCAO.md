# Guia de Manutenção — IA Dosimetria Penal

## Arquitetura de Deploy

A plataforma usa **dois repositórios e duas contas de hosting**:

### Repositórios
- **Seu repositório (dev):** `https://github.com/batista-fagner/luizaDosimetriaIA`
  - Frontend + Backend
  - Conectado ao seu Vercel pessoal
  - Backend rodando no seu Railway pessoal

- **Repositório da cliente:** `https://github.com/LuizaDr027/drluIA`
  - Cópia completa do código
  - Frontend conectado ao Vercel da cliente
  - Backend conectado ao Railway da cliente

### Hosting
- **Frontend (Vercel):** `https://chat.dosimetriadepena.com/dralu`
  - Domínio customizado apontando para `chat.dosimetriadepena.com`
  - Base path: `/dralu`
  - Repositório: `LuizaDr027/drluIA` (GitHub da cliente)

- **Backend (Railway):** `https://drluia-production.up.railway.app`
  - Repositório: `LuizaDr027/drluIA` (GitHub da cliente)
  - Conta Railway da cliente

## Fluxo de Deploy

### Quando fazer mudanças no código:

1. **Editar localmente** na sua máquina
2. **Push para seu repositório** (atualiza seu ambiente de dev):
   ```bash
   git push origin main
   ```
   - Vercel (seu) redeploya em ~1-2 min
   - Seu Railway redeploya em ~1-2 min

3. **Push para repositório da cliente** (atualiza produção dela):
   ```bash
   git push https://github.com/LuizaDr027/drluIA.git main
   ```
   - Vercel (cliente) redeploya em ~1-2 min
   - Railway (cliente) redeploya em ~1-2 min

## Variáveis de Ambiente

### Frontend (.env.production)
```
VITE_API_URL=https://drluia-production.up.railway.app
```
- Aponta para o backend **da cliente** no Railway
- Se precisar testar com seu backend: `https://luizadosimetriaia-production.up.railway.app`

### Frontend (.env.development)
```
VITE_API_URL=http://localhost:3001
```
- Para rodar localmente

### Backend Railway (cliente)
```
AI_PROVIDER=gemini
GOOGLE_API_KEY=...
OPENAI_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
DATABASE_URL=...
GOOGLE_SERVICE_ACCOUNT_B64=...
FRONTEND_URL=https://chat.dosimetriadepena.com
PORT=3001
```

- **FRONTEND_URL:** Para CORS (sem `/dralu`)
- Deve ser idêntico ao seu, exceto:
  - `FRONTEND_URL` aponta para domínio da cliente
  - Credenciais (Supabase, Google, OpenAI) podem ser diferentes se usar serviços separados

## Configuração DNS (Hostinger)

**Domínio:** `dosimetriadepena.com`

### Registros configurados:
- **CNAME | www | club.kiwerfy.com** ← Kiwify (site de vendas)
- **CNAME | chat | efbe33ade114fb36.vercel-dns-017.com** ← Vercel (frontend da IA)

**Importante:** O `www` aponta para Kiwify, então a IA usa subdomínio `chat` em vez de `www`.

## Configuração Vercel (Cliente)

**Projeto:** `chat.dosimetriadepena.com`

### Settings → Domains
- `chat.dosimetriadepena.com` ← produção

### Settings → Environment Variables (Production)
```
VITE_API_URL=https://drluia-production.up.railway.app
```

## Configuração Railway (Cliente)

**Projeto:** `drluia-production`

### Root Directory
```
ia-dosimetria/backend
```

### Variables
Todas as chaves de API, credenciais e `FRONTEND_URL`

## Permissões GitHub

**Colaborador:** `batista-fagner` tem acesso ao repositório `LuizaDr027/drluIA`
- Necessário para fazer push ao repositório dela

Se perder acesso:
1. Pede à cliente ir em: Repositório → Settings → Collaborators → Manage access
2. Convida `batista-fagner` novamente

## Fluxo de Atualização do Cliente

Quando precisa fazer uma mudança:

1. Edita o código localmente
2. Testa em localhost
3. `git add .` e `git commit`
4. `git push origin main` ← seu repositório
5. Aguarda Vercel (seu) terminar o deploy
6. `git push https://github.com/LuizaDr027/drluIA.git main` ← repositório dela
7. Aguarda Vercel e Railway (dela) terminarem
8. Testa em `https://chat.dosimetriadepena.com/dralu`

## Troubleshooting

### Cliente relata erro de CORS
- Verifique `FRONTEND_URL` no Railway dela
- Deve ser `https://chat.dosimetriadepena.com` (sem `/dralu`)

### Logo/assets não aparecem
- Verifique se o `vercel.json` está com os rewrites corretos
- Incluir rewrites para `/dralu/assets` e logos

### Frontend aponta para seu backend antigo
- Verifique `.env.production` no código
- Confirme que fez push para ambos os repositórios

### Domínio não resolve
- Aguarde 5-15 min para DNS propagar
- Verifique CNAME em Hostinger: `chat` → `efbe33ade114fb36.vercel-dns-017.com`

## Credenciais e Segurança

- **Google Service Account:** armazenada como `GOOGLE_SERVICE_ACCOUNT_B64` no Railway (base64)
- **Chaves API:** Supabase, Google, OpenAI — no `.env` do Railway
- **Nunca commitar:** `.env` files, credenciais, tokens

## Próximas Etapas (Futuro)

- [ ] Webhook Kiwify para auto-importar alunos
- [ ] Dashboard admin com estatísticas
- [ ] Suporte a múltiplos idiomas
- [ ] Modo dark
