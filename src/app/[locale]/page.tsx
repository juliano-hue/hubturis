'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import StarDisplay from '@/components/StarDisplay';

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
}

// Lista de imagens disponíveis
const imagens = [
  '/Frank/IMG_3433.JPG',
  '/Frank/IMG_3434.JPG',
  '/Frank/IMG_3435.JPG',
  '/Frank/IMG_3436.JPG',
  '/Frank/IMG_3437.JPG',
  '/Frank/IMG_3438.JPG',
  '/Frank/IMG_3439.JPG',
  '/Frank/IMG_3440.JPG',
  '/Frank/IMG_3441.JPG',
  '/Frank/IMG_3442.JPG',
  '/Frank/IMG_3443.JPG',
  '/Frank/IMG_3444.JPG',
  '/Frank/IMG_3445.JPG',
  '/Frank/IMG_3446.JPG',
  '/Frank/IMG_3447.JPG',
  '/Frank/IMG_3448.JPG',
  '/Frank/IMG_3449.JPG',
  '/Frank/IMG_3450.JPG',
  '/Frank/IMG_3451.JPG',
  '/Frank/IMG_3452.JPG',
  '/Frank/IMG_3453.JPG',
  '/Frank/IMG_3454.JPG',
  '/Frank/IMG_3455.JPG',
  '/Frank/IMG_3456.JPG',
  '/Frank/IMG_5404.JPEG',
  '/Frank/IMG_5405.JPEG',
  '/Frank/IMG_8094.JPEG',
  '/Frank/IMG_8095.JPEG',
];

// Lista de vídeos
const videos = [
  '/Frank/IMG_5404.MOV',
  '/Frank/IMG_8094.MOV',
  '/Frank/IMG_8095.MOV',
  '/Frank/WhatsApp Video 2021-10-15 at 16.01.50.mp4',
];

export default function HomePage() {
  const router = useRouter();
  const t = useTranslations('home');
  const common = useTranslations('common');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [heroImage, setHeroImage] = useState(imagens[0]);
  const [videoAtual, setVideoAtual] = useState(videos[0]);
  const [featuredAttractions, setFeaturedAttractions] = useState<Attraction[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchFeaturedAttractions = async () => {
      try {
        const res = await fetch('/api/attractions');
        const data = await res.json();
        const attractionsList = Array.isArray(data) ? data : [];
        const shuffled = [...attractionsList].sort(() => 0.5 - Math.random());
        if (isMounted) {
          setFeaturedAttractions(shuffled.slice(0, 6));
          setLoadingFeatured(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Erro ao buscar atrações:', error);
          setLoadingFeatured(false);
        }
      }
    };

    fetchFeaturedAttractions();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    setMounted(true);
    const randomImageIndex = Math.floor(Math.random() * imagens.length);
    setHeroImage(imagens[randomImageIndex]);
    const randomVideoIndex = Math.floor(Math.random() * videos.length);
    setVideoAtual(videos[randomVideoIndex]);
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    if (userId) {
      setIsLoggedIn(true);
      setUserName(name || 'Viajante');
      setUserRole(role || '');
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      localStorage.clear();
      document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      setIsLoggedIn(false);
      router.push('/');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/attractions?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('/attractions');
    }
  };

  const handleAttractionClick = (attractionId: string) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/register?message=CADASTRE-SE OU FAÇA O SEU LOGIN');
    } else {
      router.push(`/attractions/${attractionId}`);
    }
  };

  const getImageUrl = (attraction: Attraction) => {
    if (attraction.images && attraction.images.length > 0) {
      return attraction.images[0];
    }
    return '/Frank/IMG_3433.JPG';
  };

  const formatPrice = (price: number, pricingType: string) => {
    return `R$ ${price}`;
  };

  const getDashboardLink = () => {
    if (userRole === 'PROVIDER') return '/provider/my-attractions';
    return '/consumer';
  };

  const categorias = [
    { nome: 'Aventura', icone: '🏄', cor: 'bg-orange-100 text-orange-600', descricao: 'Esportes radicais e adrenalina' },
    { nome: 'Cultural', icone: '🏛️', cor: 'bg-purple-100 text-purple-600', descricao: 'História e arte local' },
    { nome: 'Ecoturismo', icone: '🌿', cor: 'bg-green-100 text-green-600', descricao: 'Natureza e sustentabilidade' },
    { nome: 'Praia', icone: '🏖️', cor: 'bg-blue-100 text-blue-600', descricao: 'Sol, mar e diversão' },
    { nome: 'Gastronomia', icone: '🍽️', cor: 'bg-red-100 text-red-600', descricao: 'Sabores e experiências' },
    { nome: 'City Tour', icone: '🏙️', cor: 'bg-indigo-100 text-indigo-600', descricao: 'Conheça a cidade' },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-base sm:text-xl">{common('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section 
        className="relative min-h-[80vh] sm:min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${heroImage}')` }}
      >
        <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 text-gray-100">
            {t('hero.subtitle')}
          </p>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-2 sm:px-0">
            <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-2 shadow-xl">
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-gray-800 placeholder-gray-400 focus:outline-none rounded-xl text-base"
              />
              <button
                type="submit"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all text-sm sm:text-base min-h-[44px]"
              >
                🔍 {t('hero.searchButton')}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* DESTINOS EM DESTAQUE */}
      <section id="destinos" className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              {t('featured')}
            </h2>
            <p className="text-base sm:text-xl text-gray-600">{t('featuredSub')}</p>
          </div>
          
          {loadingFeatured ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {featuredAttractions.map((attr) => (
                <div
                  key={attr.id}
                  onClick={() => handleAttractionClick(attr.id)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                >
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img
                      src={getImageUrl(attr)}
                      alt={attr.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 shadow-lg">
                      <span className="text-blue-600 font-bold text-xs sm:text-sm">{formatPrice(attr.price, attr.pricingType)}</span>
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
                        <span className="text-xs text-gray-500">({attr.totalReviews})</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-3">{attr.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {attr.duration && (
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <span>⏱️</span>
                            <span>{attr.duration}h</span>
                          </div>
                        )}
                      </div>
                      <div className="text-blue-600 text-xs sm:text-sm font-medium group-hover:translate-x-1 transition">
                        {common('seeDetails')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8 sm:mt-12">
            <Link 
              href={`/attractions`} 
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition transform hover:scale-105 text-sm sm:text-base min-h-[44px]"
            >
              {common('seeAll')} →
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section id="categorias" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              {common('categories')}
            </h2>
            <p className="text-base sm:text-xl text-gray-600">{t('categoriesSub')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categorias.map((categoria, index) => (
              <div
                key={index}
                onClick={() => router.push(`/attractions?category=${categoria.nome}`)}
                className="group p-4 sm:p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition-all cursor-pointer bg-white"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 ${categoria.cor} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 group-hover:scale-110 transition`}>
                  {categoria.icone}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{categoria.nome}</h3>
                <p className="text-gray-500 text-xs sm:text-sm">{categoria.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VÍDEO DESTAQUE */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            {t('video')}
          </h2>
          <p className="text-base sm:text-xl text-blue-200 mb-6 sm:mb-8">
            {t('videoSub')}
          </p>
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <video key={videoAtual} src={videoAtual} controls className="w-full rounded-2xl max-h-[400px] sm:max-h-[500px]" />
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              {common('testimonials')}
            </h2>
            <p className="text-base sm:text-xl text-gray-600">{t('testimonialsSub')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { nome: 'Ana Souza', local: 'São Paulo', texto: 'Experiência incrível! O passeio de buggy foi inesquecível.', nota: 5, imagem: '👩' },
              { nome: 'Carlos Mendes', local: 'Rio de Janeiro', texto: 'Plataforma fácil de usar e atendimento excelente.', nota: 5, imagem: '👨' },
              { nome: 'Fernanda Lima', local: 'Belo Horizonte', texto: 'Encontrei passeios únicos que não sabia que existiam.', nota: 5, imagem: '👩' },
            ].map((dep, index) => (
              <div key={index} className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xl sm:text-2xl text-white">
                    {dep.imagem}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">{dep.nome}</h4>
                    <p className="text-xs sm:text-sm text-gray-500">{dep.local}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-4">"{dep.texto}"</p>
                <div className="flex text-yellow-400 text-sm sm:text-base">{'★'.repeat(dep.nota)}{'☆'.repeat(5 - dep.nota)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            {t('cta')}
          </h2>
          <p className="text-base sm:text-xl text-blue-100 mb-6 sm:mb-8">
            {t('ctaSub')}
          </p>
          {!isLoggedIn && (
            <Link 
              href="/register" 
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-2xl hover:shadow-lg transition text-base sm:text-lg min-h-[44px]"
            >
              {common('signUp')}
            </Link>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">HubTuris</h3>
              <p className="text-xs sm:text-sm">{common('footerDesc')}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a href="#" className="text-xs sm:text-sm hover:text-white transition">{common('about')}</a>
              <a href="#" className="text-xs sm:text-sm hover:text-white transition">{common('howItWorks')}</a>
              <a href="#" className="text-xs sm:text-sm hover:text-white transition">{common('security')}</a>
              <a href="#" className="text-xs sm:text-sm hover:text-white transition">{common('help')}</a>
              <a href="#" className="text-xs sm:text-sm hover:text-white transition">{common('terms')}</a>
              <a href="#" className="text-xs sm:text-sm hover:text-white transition">{common('privacy')}</a>
            </div>
            <div className="flex gap-4 text-xl sm:text-2xl">
              <a href="#" className="hover:text-white transition">📘</a>
              <a href="#" className="hover:text-white transition">📷</a>
              <a href="#" className="hover:text-white transition">🐦</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>{common('copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}