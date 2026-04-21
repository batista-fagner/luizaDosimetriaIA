import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Layout/Header';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      {/* Hero */}
      <div
        className="relative px-4 py-8 md:px-6 md:py-12 pb-12 md:pb-16 overflow-x-hidden"
        style={{ background: 'linear-gradient(135deg, #3d2b1f 0%, #5c3d2a 50%, #8a6347 100%)' }}
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* Left column */}
          <div>
            <img src="/Logo_branca.svg" alt="Logo" className="w-36 md:w-52 mb-5 mx-auto lg:mx-0" />

            <p className="text-white/80 text-sm leading-relaxed mb-4">
              A inteligência artificial foi desenvolvida para{' '}
              <span className="font-bold text-white">auxiliar — e não substituir</span>{' '}
              — a atuação do advogado.
            </p>

            {/* Warning box */}
            <div className="bg-black/30 rounded-lg p-3 md:p-4 mb-3 flex gap-3 items-start">
              <svg className="w-5 h-5 text-white/60 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <p className="text-white/80 text-sm leading-relaxed">
                A IA <span className="font-bold text-white">não deve ser utilizada</span> como ferramenta de pesquisa de jurisprudência.
              </p>
            </div>

            <p className="text-white/50 text-xs leading-relaxed mb-5 lg:mb-0">
              Isso é intencional, para garantir maior segurança técnica e evitar o uso de precedentes desatualizados ou inventados.
            </p>
          </div>

          {/* Cards wrapper: scroll horizontal no mobile, items normais no lg */}
          <div className="flex lg:contents gap-4 overflow-x-auto pb-2 lg:pb-0 lg:overflow-visible snap-x snap-mandatory">

            {/* Middle card */}
            <div className="bg-black/25 rounded-xl p-4 md:p-6 backdrop-blur-sm shrink-0 w-[80vw] lg:w-auto snap-start">
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l9-4 9 4v6c0 5.25-3.75 10.15-9 11.5C6.75 22.15 3 17.25 3 12V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v20M3 12h18" />
                  </svg>
                </div>
              </div>

              <h3 className="text-white text-center text-xs font-bold tracking-wider mb-4 uppercase leading-tight">
                Você pode utilizá-la para:
              </h3>

              <ul className="space-y-3">
                {[
                  'Tirar dúvidas gerais sobre dosimetria da pena',
                  'Estruturar raciocínios jurídicos',
                  'Elaborar modelos de peças processuais',
                  'Analisar cenários e estratégias jurídicas',
                ].map((item) => (
                  <li key={item} className="flex gap-2 items-start text-white/80 text-xs md:text-sm leading-snug">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white/60 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right card */}
            <div className="bg-black/25 rounded-xl p-4 md:p-6 backdrop-blur-sm shrink-0 w-[80vw] lg:w-auto snap-start">
              <div className="flex justify-center mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>

              <h3 className="text-white text-center text-xs font-bold tracking-wider mb-4 uppercase leading-tight">
                Boas práticas de uso:
              </h3>

              <ul className="space-y-3">
                {[
                  'Sempre forneça o máximo de informações possíveis (tese, fase processual, competência, contexto do caso)',
                  'Utilize a IA como apoio na estrutura e estratégia',
                  'Revise integralmente todo o conteúdo gerado',
                ].map((item) => (
                  <li key={item} className="flex gap-2 items-start text-white/80 text-xs md:text-sm leading-snug">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white/60 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </div>

      {/* Tools section */}
      <div className="max-w-6xl mx-auto px-6 py-10 w-full">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className="text-gray-600 font-bold text-xs tracking-widest uppercase whitespace-nowrap">
            Ferramentas disponíveis
          </h2>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/chat')}
            className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md transition-all duration-200 flex items-start gap-4 group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-secondary transition-colors">
                Chat Jurídico
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-3">
                Converse com a IA sobre dosimetria da pena e estratégias jurídicas.
              </p>
              <span
                className="inline-block text-xs font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: '#f0e8e3', color: '#846047' }}
              >
                Ferramenta
              </span>
            </div>
            <svg className="w-4 h-4 text-gray-400 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
