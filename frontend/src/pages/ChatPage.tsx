import { useState, useEffect } from 'react';
import { Header } from '../components/Layout/Header';
import { Sidebar } from '../components/Layout/Sidebar';
import { ChatBox } from '../components/Chat/ChatBox';
import { InputArea } from '../components/Chat/InputArea';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface Conversation {
  id: string;
  title: string;
  date: string;
  time: string;
  messages: Message[];
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR');
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function createConversation(firstMessage?: string): Conversation {
  const now = new Date();
  return {
    id: Date.now().toString(),
    title: firstMessage ? firstMessage.slice(0, 40) : 'Nova conversa',
    date: formatDate(now),
    time: formatTime(now),
    messages: [],
  };
}

export function ChatPage() {
  const studentEmail = localStorage.getItem('studentEmail') ?? undefined;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Carrega conversas salvas ao entrar
  useEffect(() => {
    if (!studentEmail) return;
    fetch(`${API_URL}/api/conversations?email=${encodeURIComponent(studentEmail)}`)
      .then((r) => r.json())
      .then((data: { id: string; title: string; created_at: string }[]) => {
        if (!Array.isArray(data)) return;
        const loaded: Conversation[] = data.map((c) => {
          const date = new Date(c.created_at);
          return {
            id: c.id,
            title: c.title,
            date: formatDate(date),
            time: formatTime(date),
            messages: [],
          };
        });
        setConversations(loaded);
      })
      .catch(() => {});
  }, [studentEmail]);

  // Carrega mensagens ao selecionar uma conversa salva
  async function handleSelect(id: string) {
    setActiveId(id);
    setError(null);
    const conv = conversations.find((c) => c.id === id);
    if (!conv || conv.messages.length > 0) return;

    try {
      const res = await fetch(`${API_URL}/api/conversations/${id}/messages`);
      const data: { role: string; content: string }[] = await res.json();
      const messages: Message[] = data.map((m, i) => ({
        id: `${id}-${i}`,
        text: m.content,
        sender: m.role === 'user' ? 'user' : 'ai',
      }));
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, messages } : c))
      );
    } catch {
      // silencioso
    }
  }

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const handleNew = () => {
    const newConv = createConversation();
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setError(null);
  };

  const addMessage = (convId: string, msg: Message) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, msg] } : c))
    );
  };

  const handleSendMessage = async (text: string) => {
    setError(null);

    // Garante que há uma conversa ativa
    let convId = activeId;
    if (!convId) {
      const newConv = createConversation(text);
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConv.id);
      convId = newConv.id;
    } else {
      // Atualiza título se for a primeira mensagem
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId && c.messages.length === 0
            ? { ...c, title: text.slice(0, 40) }
            : c
        )
      );
    }

    // Adiciona mensagem do usuário
    const userMsg: Message = { id: `${Date.now()}-user`, text, sender: 'user' };
    addMessage(convId, userMsg);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId: convId, studentEmail }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Erro ao conectar com o servidor.');
      }

      // Cria mensagem da IA vazia e vai preenchendo token a token
      const aiMsgId = `${Date.now()}-ai`;
      addMessage(convId, { id: aiMsgId, text: '', sender: 'ai' });
      setIsLoading(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.error) throw new Error(payload.error);
            if (payload.token) {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === convId
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === aiMsgId ? { ...m, text: m.text + payload.token } : m
                        ),
                      }
                    : c
                )
              );
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
              throw parseErr;
            }
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Não foi possível conectar ao servidor.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    handleSelect(id);
    setSidebarOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/conversations/${id}`, { method: 'DELETE' });
    } catch {
      // silencioso
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Overlay escuro no mobile quando sidebar está aberta */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar: colapsível em mobile, sempre visível em desktop */}
        <div
          className={`fixed md:relative left-0 top-16 md:top-0 w-72 h-[calc(100vh-4rem)] md:h-full bg-white border-r border-gray-200 z-40 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelectConversation}
            onNew={handleNew}
            onDelete={handleDelete}
          />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 w-full md:w-auto">
          <ChatBox
            messages={activeConversation?.messages ?? []}
            isLoading={isLoading}
          />

          {error && (
            <div className="mx-4 mb-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />

          <footer className="text-center text-xs text-gray-400 pb-3 px-4">
            Ao utilizar esta plataforma, você concorda com os{' '}
            <a href="#" className="underline hover:text-secondary transition-colors">
              Termos de uso
            </a>{' '}
            e com a nossa{' '}
            <a href="#" className="underline hover:text-secondary transition-colors">
              Política de Privacidade
            </a>
            .
          </footer>
        </main>
      </div>
    </div>
  );
}
