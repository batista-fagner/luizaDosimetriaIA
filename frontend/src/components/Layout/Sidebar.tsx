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
  onDelete: (id: string) => void;
}

export function Sidebar({ conversations, activeId, onSelect, onNew, onDelete }: SidebarProps) {
  return (
    <div className="w-full h-full bg-white flex flex-col">
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
            <div
              key={conv.id}
              className={`group relative flex items-center rounded-lg mb-1 transition-colors ${
                activeId === conv.id ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <button
                onClick={() => onSelect(conv.id)}
                className="flex-1 text-left px-3 py-3 min-w-0"
              >
                <p className="text-sm font-medium text-gray-800 truncate pr-6">{conv.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {conv.date} &nbsp; {conv.time}
                </p>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                title="Apagar conversa"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
