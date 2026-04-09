import { useState, useRef } from 'react';

interface ImportModalProps {
  onClose: () => void;
}

interface ImportResult {
  imported: number;
  students: { email: string; name: string | null }[];
}

export function ImportModal({ onClose }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const email = localStorage.getItem('studentEmail') ?? '';
      const res = await fetch('http://localhost:3001/api/admin/import-students', {
        method: 'POST',
        headers: { 'x-student-email': email },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao importar.');
        return;
      }
      setResult(data);
    } catch {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Importar alunos (CSV)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {!result ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Exporte a lista de compradores da Kiwify em CSV e faça o upload aqui.
              O arquivo deve ter uma coluna <strong>email</strong>.
            </p>

            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#CAB2A4] transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              {file ? (
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
              ) : (
                <p className="text-sm text-gray-400">Clique para selecionar o arquivo CSV</p>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#846047' }}
              >
                {loading ? 'Importando...' : 'Importar'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <p className="text-3xl font-bold mb-1" style={{ color: '#846047' }}>{result.imported}</p>
              <p className="text-sm text-gray-500">alunos importados com sucesso</p>
            </div>
            <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 mb-5">
              {result.students.map((s) => (
                <div key={s.email} className="px-4 py-2.5">
                  <p className="text-sm text-gray-700">{s.name || '—'}</p>
                  <p className="text-xs text-gray-400">{s.email}</p>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ backgroundColor: '#846047' }}
            >
              Fechar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
