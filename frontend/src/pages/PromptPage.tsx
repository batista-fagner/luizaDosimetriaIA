import { useState, useEffect } from 'react';
import { Header } from '../components/Layout/Header';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function PromptPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const studentEmail = localStorage.getItem('studentEmail') || '';

  useEffect(() => {
    fetch(`${API_URL}/api/admin/prompt`, {
      headers: { 'x-student-email': studentEmail },
    })
      .then((r) => r.json())
      .then((data) => setPrompt(data.prompt ?? ''))
      .finally(() => setLoading(false));
  }, [studentEmail]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/prompt`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-student-email': studentEmail,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar.' });
      } else {
        setMessage({ type: 'success', text: 'Prompt salvo com sucesso! A IA já está usando o novo prompt.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurar Prompt da IA</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edite abaixo o prompt que define o comportamento da assistente. Ao salvar, a IA usará o novo
            prompt imediatamente.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-secondary rounded-full animate-spin" />
            Carregando prompt...
          </div>
        ) : (
          <>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={28}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 resize-y"
              style={{ focusRingColor: '#CAB2A4' } as React.CSSProperties}
              placeholder="Digite o prompt da IA aqui..."
            />

            {message && (
              <p
                className={`text-sm font-medium rounded-lg px-4 py-3 ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {message.text}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ backgroundColor: '#846047' }}
              >
                {saving ? 'Salvando...' : 'Salvar Prompt'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
