import OpenAI from 'openai';
import { findRelevantChunks, buildContextFromChunks } from './vectorSearch';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Você é uma IA especialista em Dosimetria Penal brasileira, desenvolvida para auxiliar estudantes de Direito.

INSTRUÇÕES IMPORTANTES:
1. PERGUNTAS JURÍDICAS: Responda com profundidade e completude. Cite artigos, jurisprudência e exemplos quando relevante. Estas respostas podem ser longas.
2. SAUDAÇÕES/AGRADECIMENTOS: Responda brevemente (1-2 frases). Ex: "Obrigado! Fico feliz em ajudar."
3. Use linguagem clara e direta.
4. Use negrito (**texto**) para destacar termos jurídicos e conceitos importantes.

FORMATAÇÃO (obrigatório):
- Separe parágrafos com DUAS linhas em branco (três quebras de linha).
- Entre seções ou blocos temáticos distintos, insira uma linha separadora: ---
- Use títulos com ## ou ### para organizar seções longas.
- Use listas com marcadores (- item) apenas quando listar itens distintos; caso contrário, use parágrafos separados.
- NUNCA junte dois parágrafos na mesma linha. Cada ideia nova começa em um novo parágrafo com espaçamento duplo.

Exemplo de estrutura esperada:
Primeiro parágrafo com a ideia inicial.


---


Segundo parágrafo com a próxima ideia.

ESCOPO: Dosimetria Penal brasileira
- Cálculo de penas (3 fases)
- Agravantes e atenuantes
- Concurso de crimes
- Regime inicial de pena
- Jurisprudência do STF/STJ
- Lei 7.210/84 (LEP)

Se a pergunta não for sobre direito penal, responda educadamente que seu escopo é especializado.`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<string> {
  // Busca contexto relevante nos documentos do Drive
  const userMessage = messages[messages.length - 1].content;
  const relevantChunks = await findRelevantChunks(userMessage);
  const context = buildContextFromChunks(relevantChunks);

  const systemContent = context ? `${SYSTEM_PROMPT}\n\n${context}` : SYSTEM_PROMPT;

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemContent },
      ...messages,
    ],
    temperature: 0.3,
    max_tokens: 1500,
    stream: true,
  });

  let fullReply = '';
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? '';
    if (token) {
      fullReply += token;
      onChunk(token);
    }
  }
  return fullReply;
}
