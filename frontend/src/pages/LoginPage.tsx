import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Acesso não autorizado.');
        return;
      }

      localStorage.setItem('studentEmail', data.email);
      if (data.name) localStorage.setItem('studentName', data.name);
      if (data.role) localStorage.setItem('studentRole', data.role);

      navigate('/');
    } catch {
      setError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #6b4d37 0%, #846047 40%, #CAB2A4 100%)' }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          {/* Substituir pela imagem da advogada quando disponível */}
          <div
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white"
            style={{ backgroundColor: '#846047' }}
          >
            IA
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dosimetria Penal IA</h1>
          <p className="text-gray-500 text-sm">Digite seu email de acesso para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#CAB2A4' } as React.CSSProperties}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#846047' }}
          >
            {loading ? 'Verificando...' : 'Acessar plataforma'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Acesso exclusivo para alunos cadastrados
        </p>
      </div>
    </div>
  );
}
