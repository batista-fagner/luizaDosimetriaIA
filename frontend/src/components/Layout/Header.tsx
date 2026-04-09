import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ImportModal } from '../Admin/ImportModal';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const studentName = localStorage.getItem('studentName');
  const studentEmail = localStorage.getItem('studentEmail');
  const isAdmin = localStorage.getItem('studentRole') === 'admin';
  const initial = (studentName || studentEmail || 'A')[0].toUpperCase();
  const [showImport, setShowImport] = useState(false);

  function handleLogout() {
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentRole');
    navigate('/login');
  }

  const navLinks = [
    { label: 'Início', to: '/' },
    { label: 'Chat Jurídico', to: '/chat' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-sm">IA</span>
          </div>
          <span className="font-semibold text-gray-900 text-lg">Dosimetria Penal</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'text-secondary border-b-2 border-secondary pb-0.5'
                  : 'text-gray-600 hover:text-secondary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Avatar + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            {studentName && <p className="text-xs font-medium text-gray-700 leading-none">{studentName}</p>}
            {studentEmail && <p className="text-xs text-gray-400 mt-0.5">{studentEmail}</p>}
          </div>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="text-secondary font-semibold text-sm">{initial}</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowImport(true)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: '#f0e8e3', color: '#846047' }}
              title="Importar alunos"
            >
              Importar alunos
            </button>
          )}
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors font-medium"
            title="Sair"
          >
            Sair
          </button>
        </div>

        {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      </div>
    </header>
  );
}
