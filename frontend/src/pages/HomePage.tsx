import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Layout/Header';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div
        className="py-28 px-6 text-center flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #6b4d37 0%, #846047 40%, #CAB2A4 100%)',
          minHeight: '220px',
        }}
      >
        {/* Geometric pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Diagonal lines overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #fff,
              #fff 1px,
              transparent 1px,
              transparent 12px
            )`,
          }}
        />
        <h1 className="relative text-3xl md:text-4xl font-bold text-white drop-shadow-md">
          Qual ferramenta você está buscando?
        </h1>
      </div>

      {/* Tools section */}
      <div className="max-w-4xl mx-auto px-6 py-10 w-full">
        <h2 className="text-gray-700 font-semibold text-lg mb-6">Ferramentas disponíveis</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Chat Jurídico card */}
          <button
            onClick={() => navigate('/chat')}
            className="bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-md hover:border-primary transition-all duration-200 group"
          >
            <h3 className="font-semibold text-gray-900 text-base mb-3 group-hover:text-secondary transition-colors">
              Chat Jurídico
            </h3>
            <span
              className="inline-block text-xs font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: '#f0e8e3', color: '#846047' }}
            >
              Ferramenta
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
