import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

interface ChatBoxProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatBox({ messages, isLoading = false }: ChatBoxProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-3xl mx-auto">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-5xl mb-4">⚖️</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Chat Jurídico — Dosimetria Penal
            </h2>
            <p className="text-gray-400 text-sm max-w-sm">
              Tire suas dúvidas sobre cálculo de penas, circunstâncias agravantes, atenuantes e jurisprudência.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg.text} sender={msg.sender} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Pensando...
              </div>
            )}

            <div ref={endRef} />
          </>
        )}
      </div>
    </div>
  );
}
