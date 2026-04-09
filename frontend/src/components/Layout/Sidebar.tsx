interface Conversation {
  id: string;
  title: string;
  date: string;
  time: string;
}

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function Sidebar({ conversations, activeId, onSelect, onNew }: SidebarProps) {
  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white font-medium text-sm transition-colors"
          style={{ backgroundColor: '#CAB2A4' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b89d8e')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#CAB2A4')}
        >
          <span className="text-lg leading-none">+</span>
          Nova conversa
        </button>
      </div>

      <div className="px-4 pb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Conversas</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-6 px-4">
            Nenhuma conversa ainda
          </p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left px-3 py-3 rounded-lg mb-1 transition-colors ${
                activeId === conv.id
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
              }`}
            >
              <p className="text-sm font-medium text-gray-800 truncate">{conv.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {conv.date} &nbsp; {conv.time}
              </p>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
