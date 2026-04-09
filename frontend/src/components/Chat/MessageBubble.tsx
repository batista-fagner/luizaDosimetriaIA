import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: string;
  sender: 'user' | 'ai';
}

export function MessageBubble({ message, sender }: MessageBubbleProps) {
  const isUser = sender === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div
          className="max-w-xs lg:max-w-lg px-4 py-3 rounded-2xl rounded-tr-sm text-sm text-gray-800 leading-relaxed"
          style={{ backgroundColor: '#e8ddd8' }}
        >
          {message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4 gap-3">
      <div className="flex-1 max-w-2xl text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            hr: () => (
              <hr className="my-4 border-0 border-t border-[#CAB2A4] opacity-60" />
            ),
            p: ({ children }) => (
              <p className="mb-4">{children}</p>
            ),
          }}
        >
          {message}
        </ReactMarkdown>
      </div>
    </div>
  );
}
