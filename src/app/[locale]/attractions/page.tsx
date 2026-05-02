'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import StarDisplay from '@/components/StarDisplay';
// 🔽 COLE ESTA LINHA AQUI 🔽
export const dynamic = 'force-dynamic';

interface Attraction {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  state: string;
  price: number;
  pricingType: string;
  duration: number | null;
  maxCapacity: number | null;
  category: string | null;
  images: string[];
  averageRating: number;
  totalReviews: number;
  provider: {
    name: string | null;
    email: string;
  };
}

// Imagens disponíveis na pasta atracoes-natal
const imagensDisponiveis = [
  '/atracoes-natal/Flow,_gere_para_202sss604211745.jpg',
  '/atracoes-natal/Flow,_gere_para_sss202fgdsssddszcs604211745.jpg',
  '/atracoes-natal/Flow,_gere_para_sss202fgdssss604211745.jpg',
  '/atracoes-natal/Flow,_gere_para_sss202sss604211745.jpg',
  '/atracoes-natal/Fotos_asdatraaasções_turismoasdaDF_202604211744.jpg',
  '/atracoes-natal/Fotos_asdatraaasções_turismo_202604211744.jpg',
  '/atracoes-natal/Fotos_asdatraaasções_turisSDFASmoasdaDF_202604211744.jpg',
  '/atracoes-natal/Fotos_asdatrações_turismo_202604211744.jpg',
  '/atracoes-natal/Fotos_atrações_turismo_202604211744 (1).jpeg',
  '/atracoes-natal/Fotos_atrações_turismo_202604211745.jpeg',
  '/atracoes-natal/Gere_imagens_turísticas_202604211742.jpeg',
  '/atracoes-natal/Gere_imagens_turísticas_202604211743 (1).jpeg',
  '/atracoes-natal/Gere_imagens_turísticas_202604211743.jpeg',
  '/atracoes-natal/Mitsubishi_Pajero_dune_202604211712.jpeg',
];

export default function AttractionsPage() {
  const router = useRouter();
  const t = useTranslations('attractions');
  const common = useTranslations('common');
  const locale = useLocale();
  
  // 🔍 LOGS PARA DEPURAÇÃO
  console.log('🌐 ========== ATTRACTIONS PAGE DEBUG ==========');
  console.log('🌐 Idioma (locale):', locale);
  console.log('🌐 hero.title:', t('hero.title'));
  console.log('🌐 common.copyright:', common('copyright'));
  console.log('🌐 =============================================');
  
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [fundoIndex, setFundoIndex] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Verificar login ao carregar
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    if (userId) {
      setIsLoggedIn(true);
      setUserRole(role);
      
      // Carregar favoritos
      fetch('/api/favorites', {
        headers: { 'x-user-id': userId }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setFavorites(data.map((f: any) => f.attractionId));
          } else {
            console.log('Favoritos: dados não são array', data);
            setFavorites([]);
          }
        })
        .catch(console.error);
    }
  }, []);

  // Mudar imagem de fundo a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setFundoIndex((prev) => (prev + 1) % imagensDisponiveis.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Categorias com tradução
  const categories = [
    { id: 'all', name: t('categories.all'), icon: '🌎', color: 'from-gray-500 to-gray-600' },
    { id: 'Aventura', name: t('categories.adventure'), icon: '🏄', color: 'from-orange-500 to-red-500' },
    { id: 'Cultural', name: t('categories.cultural'), icon: '🏛️', color: 'from-purple-500 to-pink-500' },
    { id: 'Ecoturismo', name: t('categories.ecotourism'), icon: '🌿', color: 'from-green-500 to-emerald-500' },
    { id: 'Praia', name: t('categories.beach'), icon: '🏖️', color: 'from-blue-500 to-cyan-500' },
    { id: 'City Tour', name: t('categories.cityTour'), icon: '🏙️', color: 'from-indigo-500 to-blue-500' },
  ];

  // Cidades (nomes em português mesmo, pois são locais brasileiros)
  const cities = [
    { id: 'all', name: t('cities.all'), icon: '📍' },
    { id: 'Natal', name: 'Natal/RN', icon: '🏖️' },
    { id: 'Imbituba', name: 'Imbituba/SC', icon: '🏄' },
  ];

  useEffect(() => {
    fetch('/api/attractions')
      .then(res => res.json())
      .then(data => {
        const attractionsList = Array.isArray(data) ? data : [];
        setAttractions(attractionsList);
        setFilteredAttractions(attractionsList);
        setLoading(false);
      })
      .catch(() => {
        setAttractions([]);
        setFilteredAttractions([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = [...attractions];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(attr => attr.category === selectedCategory);
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(attr => attr.city === selectedCity);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(attr =>
        attr.title.toLowerCase().includes(term) ||
        attr.city.toLowerCase().includes(term) ||
        attr.state.toLowerCase().includes(term) ||
        attr.description.toLowerCase().includes(term)
      );
    }

    setFilteredAttractions(filtered);
  }, [selectedCategory, selectedCity, searchTerm, attractions]);

  const toggleFavorite = async (attractionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      router.push('/login');
      return;
    }

    const isFavorited = favorites.includes(attractionId);

    if (isFavorited) {
      await fetch(`/api/favorites?attractionId=${attractionId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      });
      setFavorites(favorites.filter(id => id !== attractionId));
    } else {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ attractionId }),
      });
      setFavorites([...favorites, attractionId]);
    }
  };

  const getImageUrl = (attraction: Attraction, index: number) => {
    if (attraction.images && attraction.images.length > 0) {
      return attraction.images[0];
    }
    const imageIndex = index % imagensDisponiveis.length;
    return imagensDisponiveis[imageIndex];
  };

  const formatPrice = (price: number, pricingType: string, maxCapacity?: number | null) => {
    if (pricingType === 'FLAT_RATE') {
      return `R$ ${price} (${t('price.group')})`;
    }
    return `R$ ${price}`;
  };

  const handleAttractionClick = (attractionId: string) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/register?message=CADASTRE-SE OU FAÇA O SEU LOGIN');
    } else {
      router.push(`/attractions/${attractionId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="text-7xl mb-6 animate-bounce">🏖️</div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-base sm:text-xl text-gray-600 font-medium">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Botão para voltar ao perfil do consumidor (quando logado como CONSUMER) */}
      {isLoggedIn && userRole === 'CONSUMER' && (
        <div className="max-w-7xl mx-auto px-4 pt-16 sm:pt-20">
          <button
            onClick={() => router.push('/consumer')}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition shadow-md hover:shadow-lg text-xs sm:text-sm min-h-[44px]"
          >
            ← {t('backToDashboard')}
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <div 
        className="relative h-[40vh] sm:h-[50vh] min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center text-white bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${imagensDisponiveis[fundoIndex]}')` }}
      >
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-2 mb-4 sm:mb-6">
            <span className="text-yellow-400 text-xs sm:text-sm">⭐</span>
            <span className="text-xs sm:text-sm font-medium">{t('experiencesCount', { count: attractions.length })}</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-3 sm:mb-6">
            {t('hero.title')}
          </h1>
          
          <p className="text-base sm:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-10 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          
          <div className="max-w-3xl mx-auto px-2 sm:px-0">
            <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">🔍</span>
                <input
                  type="text"
                  placeholder={t('hero.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-gray-800 placeholder-gray-400 focus:outline-none rounded-xl text-sm sm:text-base"
                />
              </div>
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base min-h-[44px]">
                {t('hero.searchButton')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIAS */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-medium transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm
                ${selectedCategory === cat.id 
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105` 
                  : 'bg-white text-gray-700 hover:shadow-md hover:scale-105 border border-gray-200'
                }
              `}
            >
              <span className="text-base sm:text-lg">{cat.icon}</span>
              <span className="hidden xs:inline">{cat.name}</span>
              <span className="xs:hidden">{cat.name.substring(0,3)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FILTROS POR CIDADE */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-6 sm:pb-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city.id)}
              className={`
                px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-1
                ${selectedCity === city.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              <span className="text-sm">{city.icon}</span>
              <span>{city.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-10 gap-4">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-gray-800">
              {filteredAttractions.length} {t('results.found')}
              <span className="text-base sm:text-lg font-normal text-gray-500 ml-2">{t('results.experiences')}</span>
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mt-1">{t('results.subtitle')}</p>
          </div>
        </div>

        {filteredAttractions.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl shadow-sm">
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🔍</div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-3">{t('empty.title')}</h3>
            <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
              {t('empty.message')}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedCity('all');
                setSearchTerm('');
              }}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base min-h-[44px]"
            >
              {t('empty.clearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredAttractions.map((attr, index) => (
              <div
                key={attr.id}
                className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                onMouseEnter={() => setHoveredCard(attr.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleAttractionClick(attr.id)}
              >
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={getImageUrl(attr, index)}
                    alt={attr.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      hoveredCard === attr.id ? 'scale-110 brightness-110' : 'scale-100'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Botão de Favorito */}
                  {isLoggedIn && userRole === 'CONSUMER' && (
                    <button
                      onClick={(e) => toggleFavorite(attr.id, e)}
                      className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-lg sm:text-xl hover:scale-110 transition"
                    >
                      {favorites.includes(attr.id) ? '❤️' : '🤍'}
                    </button>
                  )}

                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 shadow-lg">
                    <span className="text-blue-600 font-bold text-xs sm:text-sm">
                      {formatPrice(attr.price, attr.pricingType, attr.maxCapacity)}
                    </span>
                  </div>

                  {attr.category && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-medium text-gray-700">
                      {attr.category}
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition line-clamp-1 mb-1">
                    {attr.title}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                    <span>📍</span>
                    <span>{attr.city}, {attr.state}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <StarDisplay rating={attr.averageRating} size="sm" />
                    {attr.totalReviews > 0 && (
                      <span className="text-xs text-gray-500">
                        ({attr.totalReviews})
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-3">
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
                          <span>{t('card.upTo')} {attr.maxCapacity}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-blue-600 text-xs sm:text-sm font-medium group-hover:translate-x-1 transition">
                      {t('card.seeDetails')} →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-4 sm:py-6 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm">{common('copyright')}</p>
        </div>
      </footer>
    </div>
  );
}