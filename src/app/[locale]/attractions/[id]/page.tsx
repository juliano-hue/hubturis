'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import StarRating from '@/components/StarRating';
import StarDisplay from '@/components/StarDisplay';
// 🔽 COLE ESTA LINHA AQUI 🔽
export const dynamic = 'force-dynamic';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Availability {
  id: string;
  date: string;
  price: number | null;
  maxParticipants: number;
  isAvailable: boolean;
  bookedCount?: number;
  remainingSlots?: number;
  isFull?: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  consumer: {
    id: string;
    name: string | null;
  };
}

interface ReviewData {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

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
  provider: {
    id: string;
    name: string | null;
    email: string;
  };
  availabilities: Availability[];
}

export default function AttractionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('attraction');
  const common = useTranslations('common');
  
  const attractionId = params.id as string;
  
  console.log('🔍 ID da atração (params.id):', attractionId);
  
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [participants, setParticipants] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userReviewId, setUserReviewId] = useState<string | null>(null);

  // Função para garantir caminho absoluto da imagem
  const getImagePath = (path: string) => {
    if (!path) return '/Frank/IMG_3433.JPG';
    if (path.startsWith('/')) return path;
    return `/${path}`;
  };

  // Função para fallback de imagem
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/Frank/IMG_3433.JPG';
  };

  const isVideoFile = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.MP4', '.WEBM', '.MOV', '.AVI'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const getAvailabilityForDate = (date: Date): Availability | null => {
    if (!attraction) return null;
    // Use local year/month/day to avoid UTC offset shifting the date
    const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return attraction.availabilities.find((a: Availability) =>
      a.isAvailable && a.date.split('T')[0] === localDateStr
    ) || null;
  };

  const isDateAvailable = (date: Date): boolean => {
    return getAvailabilityForDate(date) !== null;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!attractionId) {
        console.error('❌ ID não encontrado');
        setError('ID da atração não encontrado');
        setLoading(false);
        return;
      }
      
      try {
        console.log(`📡 Buscando atração: /api/attractions/${attractionId}`);
        const res = await fetch(`/api/attractions/${attractionId}`);
        
        if (!res.ok) {
          console.error(`❌ Erro HTTP: ${res.status}`);
          throw new Error('Erro ao carregar atração');
        }
        
        const data = await res.json();
        setAttraction(data);
        
        const reviewsRes = await fetch(`/api/reviews?attractionId=${attractionId}`);
        let reviewsData: ReviewData = { reviews: [], averageRating: 0, totalReviews: 0 };
        if (reviewsRes.ok) {
          reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews || []);
          setAverageRating(reviewsData.averageRating || 0);
          setTotalReviews(reviewsData.totalReviews || 0);
        }
        
        const userId = localStorage.getItem('userId');
        if (userId && reviewsData.reviews) {
          const userReview = reviewsData.reviews.find((r: Review) => r.consumer.id === userId);
          if (userReview && userReview.id) {
            setUserHasReviewed(true);
            setUserReviewId(userReview.id);
            setUserRating(userReview.rating);
            setUserComment(userReview.comment || '');
          }
        }
      } catch (error) {
        console.error('Erro:', error);
        setError(t('errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [attractionId, t]);

  useEffect(() => {
    if (selectedDate) {
      const availability = getAvailabilityForDate(selectedDate);
      setSelectedAvailability(availability || null);
    }
  }, [selectedDate, attraction]);

  const calculateTotalPrice = () => {
    if (!attraction) return 0;
    if (attraction.pricingType === 'FLAT_RATE') return attraction.price;
    const pricePerPerson = selectedAvailability?.price || attraction.price;
    return pricePerPerson * participants;
  };

  const formatPriceDisplay = () => {
    if (!attraction) return '';
    if (attraction.pricingType === 'FLAT_RATE') {
      const maxCap = attraction.maxCapacity ?? 0;
      return `R$ ${attraction.price} (${t('flatRatePrice', { maxCapacity: maxCap })})`;
    }
    return `R$ ${attraction.price} / ${t('perPerson')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleAddToCart = async () => {
    if (!selectedDate || !selectedAvailability) {
      alert(t('selectDateAlert'));
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      // Salva intenção no sessionStorage para retomar após login
      sessionStorage.setItem('pendingAttraction', JSON.stringify({
        attractionId: attraction?.id,
        date: selectedAvailability?.date,
        participants,
      }));
      router.push(`/${locale}/login?redirect=/${locale}/attractions/${attraction?.id}`);
      return;
    }

    setIsAddingToCart(true);
    setError('');

    try {
      const totalPrice = calculateTotalPrice();

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          attractionId: attraction?.id,
          availabilityId: selectedAvailability.id,
          date: selectedAvailability.date,
          participants,
          totalPrice,
          specialRequests: specialRequests || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('addToCartError'));
      }

      alert(t('addToCartSuccess'));
      router.push(`/${locale}/consumer/cart`);
    } catch (error: any) {
      console.error('Erro:', error);
      setError(error.message);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleSubmitReview = async () => {
    if (userRating === 0) {
      setReviewError(t('selectRatingError'));
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push(`/${locale}/login`);
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          rating: userRating,
          comment: userComment,
          attractionId: attraction?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('reviewError'));
      }

      setReviewSuccess(t('reviewSuccess'));
      setUserHasReviewed(true);
      setUserReviewId(data.id);
      
      const reviewsRes = await fetch(`/api/reviews?attractionId=${attraction?.id}`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
        setAverageRating(reviewsData.averageRating || 0);
        setTotalReviews(reviewsData.totalReviews || 0);
      }
    } catch (err: any) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl sm:text-2xl">{common('loading')}</div>
      </div>
    );
  }

  if (error && !attraction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl sm:text-2xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl sm:text-2xl">{t('notFound')}</div>
      </div>
    );
  }

  // CORREÇÃO DAS IMAGENS: Garantir caminhos absolutos
  const imagens = attraction.images && attraction.images.length > 0 
    ? attraction.images.map(img => getImagePath(img))
    : ['/Frank/IMG_3433.JPG', '/Frank/IMG_3440.JPG', '/Frank/IMG_3445.JPG'];

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      if (isDateAvailable(date)) return 'available-tile';
      return 'unavailable-tile';
    }
    return '';
  };

  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') return !isDateAvailable(date);
    return false;
  };

  const jsonLd = attraction ? {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: attraction.title,
    description: attraction.description,
    image: attraction.images?.[0],
    url: `https://hubturis.com.br/${locale}/attractions/${attractionId}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: attraction.city,
      addressRegion: attraction.state,
      addressCountry: 'BR',
    },
    offers: {
      '@type': 'Offer',
      price: attraction.price,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'HubTuris' },
    },
    aggregateRating: averageRating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: totalReviews,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <Link href={`/attractions`} className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm sm:text-base">
            ← {t('backToAttractions')}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <div className="lg:flex-[2]">
            {/* Galeria */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-6">
              <div className="relative h-64 sm:h-80 md:h-96 bg-gray-200">
                {isVideoFile(imagens[selectedImageIndex]) ? (
                  <video src={imagens[selectedImageIndex]} controls className="w-full h-full object-cover" />
                ) : (
                  <img 
                    src={imagens[selectedImageIndex]} 
                    alt={attraction.title} 
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                )}
              </div>
              
              {imagens.length > 1 && (
                <div className="flex gap-2 p-3 sm:p-4 overflow-x-auto">
                  {imagens.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                        selectedImageIndex === idx ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      {isVideoFile(img) ? (
                        <>
                          <video src={img} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-base sm:text-xl">🎬</span>
                          </div>
                        </>
                      ) : (
                        <img 
                          src={img} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Título e avaliação - resto do código igual */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg mb-6">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {attraction.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    <span>📍 {attraction.city}, {attraction.state}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="break-words">{attraction.location}</span>
                  </div>
                </div>
                {attraction.category && (
                  <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm">
                    {attraction.category}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4 mb-4">
                <StarDisplay rating={averageRating} size="md" />
                {totalReviews > 0 && (
                  <span className="text-xs sm:text-sm text-gray-500">
                    {totalReviews} {totalReviews !== 1 ? t('reviewsPlural') : t('reviewsSingular')}
                  </span>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3">{t('aboutExperience')}</h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{attraction.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-4 border-t border-b">
                <div><div className="text-gray-500 text-xs sm:text-sm">{t('duration')}</div><div className="font-semibold text-sm sm:text-base">{attraction.duration || 2} {t('hours')}</div></div>
                <div><div className="text-gray-500 text-xs sm:text-sm">{t('capacity')}</div><div className="font-semibold text-sm sm:text-base">{t('upTo')} {attraction.maxCapacity || 10} {t('people')}</div></div>
                <div><div className="text-gray-500 text-xs sm:text-sm">{t('languages')}</div><div className="font-semibold text-sm sm:text-base">Português</div></div>
                <div><div className="text-gray-500 text-xs sm:text-sm">{t('cancellation')}</div><div className="font-semibold text-green-600 text-sm sm:text-base">{t('free')}</div></div>
              </div>
            </div>

            {/* Avaliações */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('travelerReviews')}</h2>
              
              {totalReviews === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                  <p>{t('noReviewsYet')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                          {review.consumer.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm sm:text-base">{review.consumer.name || t('traveler')}</p>
                          <div className="flex items-center gap-2">
                            <StarDisplay rating={review.rating} size="sm" showNumber={false} />
                            <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      {review.comment && <p className="text-gray-600 text-sm sm:text-base mt-2 ml-10 sm:ml-12">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}

              {!userHasReviewed ? (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3 text-base sm:text-lg">{t('rateExperience')}</h3>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('yourRating')}</label><StarRating rating={userRating} onRatingChange={setUserRating} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">{t('yourComment')}</label><textarea rows={3} value={userComment} onChange={(e) => setUserComment(e.target.value)} placeholder={t('commentPlaceholder')} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" /></div>
                    {reviewError && <div className="text-red-600 text-sm">{reviewError}</div>}
                    {reviewSuccess && <div className="text-green-600 text-sm">{reviewSuccess}</div>}
                    <button onClick={handleSubmitReview} disabled={submittingReview} className="px-5 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-gray-400 text-sm sm:text-base min-h-[44px]">{submittingReview ? t('submitting') : t('submitReview')}</button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t bg-green-50 p-3 sm:p-4 rounded-lg"><p className="text-green-700 text-sm sm:text-base">✅ {t('alreadyReviewed')}</p></div>
              )}
            </div>
          </div>

          {/* Coluna lateral - Reserva */}
          <div className="lg:flex-1">
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 sticky top-20">
              <div className="mb-5 sm:mb-6"><div className="text-2xl sm:text-3xl font-bold text-blue-600 break-words">{formatPriceDisplay()}</div></div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectDate')}</label>
                  <style>{`
                    .available-tile { background: #dcfce7 !important; color: #166534 !important; border-radius: 50% !important; font-weight: 600; }
                    .unavailable-tile { color: #d1d5db !important; cursor: not-allowed !important; }
                    .react-calendar__tile:disabled { background: transparent !important; }
                    .react-calendar__tile:disabled abbr { color: #d1d5db !important; }
                  `}</style>
                  <Calendar
                    onChange={(value) => setSelectedDate(value as Date)}
                    value={selectedDate}
                    defaultActiveStartDate={
                      attraction?.availabilities?.filter((a: any) => a.isAvailable && new Date(a.date) >= new Date()).length > 0
                        ? new Date(attraction.availabilities.filter((a: any) => a.isAvailable && new Date(a.date) >= new Date()).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].date)
                        : new Date()
                    }
                    minDate={new Date()}
                    tileClassName={tileClassName}
                    tileDisabled={tileDisabled}
                    className="rounded-lg border-0 shadow-sm w-full"
                    locale="pt-BR"
                  />
                  {selectedDate && !selectedAvailability && <p className="text-red-500 text-sm mt-2">⚠️ {t('dateNotAvailable')}</p>}
                </div>
                {selectedAvailability && (
                  <div className={`p-3 rounded-lg ${selectedAvailability.isFull ? 'bg-red-50' : 'bg-green-50'}`}>
                    {selectedAvailability.isFull ? (
                      <p className="text-red-600 text-sm font-medium">❌ Data esgotada — sem vagas disponíveis</p>
                    ) : (
                      <>
                        <p className="text-green-700 text-sm font-medium">
                          ✓ {t('dateAvailable')}: {selectedDate ? formatDate(selectedDate) : ''}
                        </p>
                        <p className="text-green-600 text-sm mt-1">
                          🎫 {selectedAvailability.remainingSlots ?? selectedAvailability.maxParticipants} vaga(s) disponível(is)
                        </p>
                        {selectedAvailability.price && selectedAvailability.price !== attraction.price && (
                          <p className="text-green-600 text-sm">{t('specialPrice')}: R$ {selectedAvailability.price}</p>
                        )}
                      </>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('participants')}</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedAvailability?.remainingSlots ?? selectedAvailability?.maxParticipants ?? attraction.maxCapacity ?? 20}
                    value={participants}
                    onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                  />
                  {selectedAvailability && !selectedAvailability.isFull && (
                    <p className="text-xs text-gray-400 mt-1">
                      Máximo: {selectedAvailability.remainingSlots ?? selectedAvailability.maxParticipants} participante(s)
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('specialRequests')}</label>
                  <textarea 
                    rows={3} 
                    value={specialRequests} 
                    onChange={(e) => setSpecialRequests(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm sm:text-base" 
                    placeholder={t('specialRequestsPlaceholder')} 
                  />
                </div>
                {error && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-base sm:text-lg font-semibold mb-4">
                    <span>{t('total')}</span>
                    <span className="text-blue-600">R$ {calculateTotalPrice().toFixed(2)}</span>
                  </div>

                  {/* Aviso para visitantes não logados */}
                  {!localStorage.getItem('userId') && selectedAvailability && !selectedAvailability.isFull && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <p className="text-blue-700 text-sm font-medium">
                        🔑 Para contratar, faça login ou cadastre-se
                      </p>
                      <p className="text-blue-500 text-xs mt-1">
                        É rápido e gratuito — voltará para esta página após o login
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !selectedAvailability || !!selectedAvailability?.isFull}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm sm:text-base min-h-[48px]"
                  >
                    {selectedAvailability?.isFull ? '❌ Data esgotada' : isAddingToCart ? t('adding') : t('addToCart')}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">🔒 {t('freeCancellation')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}