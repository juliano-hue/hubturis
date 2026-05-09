'use client';
//export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Imagens de fallback (existem no servidor)
const imagensDisponiveis = [
  '/Frank/inicial/IMG_0204.JPG',
  '/Frank/inicial/IMG_0210.JPG',
  '/Frank/inicial/IMG_0215.JPG',
  '/Frank/inicial/IMG_3443.JPG',
  '/Frank/inicial/IMG_5405.JPEG',
  '/Frank/inicial/b640676d-2da7-423c-98c7-846aebfae2e9.jpg',
];

interface Attraction {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  state: string;
  price: number;
  duration: number | null;
  maxCapacity: number | null;
  category: string | null;
  images: string[];
}

export default function MyAttractionsPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [fundoIndex, setFundoIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      setFundoIndex((prev) => (prev + 1) % imagensDisponiveis.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (!userId || role !== 'PROVIDER') {
      router.push('/login');
      return;
    }

    setUserName(name || 'Ofertante');

    fetch(`/api/provider/attractions?providerId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar');
        return res.json();
      })
      .then(data => {
        const attractionsList = data.attractions || [];
        setAttractions(attractionsList);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [isClient, router]);

  const getImageUrl = (attraction: Attraction, index: number) => {
    if (attraction.images && attraction.images.length > 0) {
      return attraction.images[0];
    }
    const imageIndex = index % imagensDisponiveis.length;
    return imagensDisponiveis[imageIndex];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl sm:text-7xl mb-4 sm:mb-6 animate-bounce">🏖️</div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-base sm:text-xl text-gray-600 font-medium">Carregando suas atrações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* HERO SECTION - RESPONSIVO */}
      <div 
        className="relative h-[40vh] sm:h-[50vh] min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center text-white bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${imagensDisponiveis[fundoIndex]}')` }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-2 mb-4 sm:mb-6">
            <span className="text-yellow-400 text-xs sm:text-sm">⭐</span>
            <span className="text-xs sm:text-sm font-medium">Meu Catálogo</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            Minhas Atrações
          </h1>
          <p className="text-base sm:text-xl text-gray-200 mb-6 sm:mb-8">
            {attractions.length === 0 
              ? 'Comece a cadastrar suas experiências!'
              : `Você tem ${attractions.length} experiência(s) para oferecer`}
          </p>
          
          <button
            onClick={() => router.push('/provider/attractions/new')}
            className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm sm:text-lg font-bold rounded-full transition-all duration-300 shadow-2xl hover:shadow-xl transform hover:scale-105 min-h-[44px]"
          >
            ✨ Nova Atração ✨
          </button>
        </div>
        
        {/* Indicador de imagem */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {imagensDisponiveis.slice(0, 5).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setFundoIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                fundoIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* NAVEGAÇÃO RÁPIDA - BOTÕES MAIORES */}
      <div className="relative py-4 sm:py-5 bg-white/80 backdrop-blur-sm border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center gap-3 sm:gap-5 flex-wrap">
          <button
            onClick={() => router.push('/provider/attractions/new')}
            className="px-5 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full font-medium transition shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base min-h-[48px]"
          >
            ➕ Nova Atração
          </button>
          <button
            onClick={() => router.push('/provider/profile')}
            className="px-5 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full font-medium transition shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base min-h-[48px]"
          >
            👤 Perfil
          </button>
          <button
            onClick={() => router.push('/provider/dashboard')}
            className="px-5 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full font-medium transition shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base min-h-[48px]"
          >
            📊 Dashboard
          </button>
        </div>
      </div>

      {/* LISTA DE ATRAÇÕES EM CARDS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {attractions.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-xl">
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🏞️</div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3">Nenhuma atração cadastrada ainda</h3>
            <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
              Comece cadastrando sua primeira experiência para atrair turistas.
            </p>
            <button
              onClick={() => router.push('/provider/attractions/new')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
            >
              ✨ Cadastrar primeira atração
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Minhas Experiências</h2>
                <p className="text-gray-500 text-sm sm:text-base mt-1">Gerencie seu catálogo de atrações</p>
              </div>
              <div className="text-sm text-gray-500 bg-white px-3 sm:px-4 py-2 rounded-full shadow-sm">
                🎯 Total: {attractions.length} atrações
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {attractions.map((attr, index) => (
                <div
                  key={attr.id}
                  className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                  onMouseEnter={() => setHoveredCard(attr.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => router.push(`/provider/attractions/${attr.id}`)}
                >
                  {/* Imagem */}
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={getImageUrl(attr, index)}
                      alt={attr.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/Frank/inicial/IMG_0204.JPG';
                      }}
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        hoveredCard === attr.id ? 'scale-110 brightness-110' : 'scale-100'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Preço */}
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 shadow-lg">
                      <span className="text-blue-600 font-bold text-xs sm:text-sm">{formatPrice(attr.price)}</span>
                      <span className="text-gray-500 text-xs">/pessoa</span>
                    </div>

                    {/* Categoria */}
                    {attr.category && (
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-medium text-gray-700">
                        {attr.category}
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-3 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition line-clamp-1 mb-1 sm:mb-2">
                      {attr.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
                      <span>📍</span>
                      <span>{attr.city}, {attr.state}</span>
                    </div>

                    <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                      {attr.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {attr.duration && (
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <span>⏱️</span>
                            <span>{attr.duration}h</span>
                          </div>
                        )}
                        {attr.maxCapacity && (
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <span>👥</span>
                            <span>até {attr.maxCapacity}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-blue-600 text-xs sm:text-sm font-medium group-hover:translate-x-1 transition">
                        Editar →
                      </div>
                    </div>

                    {/* TURBO BOOST + VIEWS */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-2 text-xs text-gray-400">
                        <span>👁️ {(attr as any).viewCount ?? 0}</span>
                        <span>🖱️ {(attr as any).clickCount ?? 0}</span>
                      </div>
                      <button
                        onClick={() => router.push('/provider/plan')}
                        className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full hover:from-orange-600 hover:to-red-600 transition"
                      >
                        ⚡ Boost
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* BOTÃO VER RESERVAS - RESPONSIVO */}
            <div className="mt-8 sm:mt-12 text-center">
              <button
                onClick={() => router.push('/provider/bookings')}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-2 text-sm sm:text-base min-h-[48px]"
              >
                📋 Ver reservas das minhas atrações
              </button>
            </div>
          </>
        )}
      </div>

      {/* CALL TO ACTION - RESPONSIVO */}
      {attractions.length > 0 && (
        <div 
          className="relative h-48 sm:h-64 flex items-center justify-center text-white text-center bg-cover bg-fixed"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${imagensDisponiveis[(fundoIndex + 2) % imagensDisponiveis.length]}')` }}
        >
          <div className="relative z-10 max-w-3xl mx-auto px-4">
            <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-3">Quer atrair mais clientes?</h2>
            <p className="text-sm sm:text-lg text-gray-200 mb-4 sm:mb-6">Cadastre mais experiências e aumente sua visibilidade</p>
            <button
              onClick={() => router.push('/provider/attractions/new')}
              className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-xl transition transform hover:scale-105 text-sm sm:text-base min-h-[44px]"
            >
              ✨ Nova Atração
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm">© 2026 HubTuris. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}