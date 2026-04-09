import { useState } from 'react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function InputArea({ onSendMessage, disabled = false }: InputAreaProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !disabled) {
        onSendMessage(input.trim());
        setInput('');
      }
    }
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <form onSubmit={handleSubmit}>
        <div className="relative border border-gray-200 rounded-2xl bg-white shadow-sm focus-within:border-primary transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Faça alguma pergunta sobre dosimetria penal"
            rows={2}
            className="w-full px-4 pt-4 pb-10 text-sm text-gray-800 placeholder-gray-400 resize-none rounded-2xl focus:outline-none disabled:bg-gray-50"
          />
          {/* Footer bar inside input */}
          <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              A IA pode cometer erros. Revise as informações.
            </span>
            <button
              type="submit"
              disabled={disabled || !input.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
              style={{ backgroundColor: input.trim() && !disabled ? '#846047' : '#d1c4bc' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
