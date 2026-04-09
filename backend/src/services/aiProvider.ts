import * as geminiService from './gemini';
import * as openaiService from './openai';

export type AIProvider = 'gemini' | 'openai';
export type ChatMessage = geminiService.ChatMessage;

const DEFAULT_PROVIDER: AIProvider = 'gemini';

function getProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || DEFAULT_PROVIDER) as AIProvider;
  if (!['gemini', 'openai'].includes(provider)) {
    console.warn(
      `⚠️  AI_PROVIDER inválido: ${provider}. Usando padrão: ${DEFAULT_PROVIDER}`
    );
    return DEFAULT_PROVIDER;
  }
  return provider;
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<string> {
  const provider = getProvider();

  try {
    if (provider === 'gemini') {
      return await geminiService.streamChatCompletion(messages, onChunk);
    } else {
      return await openaiService.streamChatCompletion(messages, onChunk);
    }
  } catch (error) {
    console.error(`[${provider}] Erro:`, error);
    throw error;
  }
}

export function getActiveProvider(): AIProvider {
  return getProvider();
}
