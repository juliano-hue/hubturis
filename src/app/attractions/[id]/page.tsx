'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import StarRating from '@/components/StarRating';
import StarDisplay from '@/components/StarDisplay';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Availability {
  id: string;
  date: string;
  price: number | null;
  maxParticipants: number;
  isAvailable: boolean;
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

  const isVideoFile = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.MP4', '.WEBM', '.MOV', '.AVI'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const getAvailabilityForDate = (date: Date): Availability | null => {
    if (!attraction) return null;
    const dateStr = date.toISOString().split('T')[0];
    return attraction.availabilities.find(a => 
      a.isAvailable && a.date.split('T')[0] === dateStr
    ) || null;
  };

  const isDateAvailable = (date: Date): boolean => {
    return getAvailabilityForDate(date) !== null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/attractions/${params.id}`);
        if (!res.ok) throw new Error('Erro ao carregar atração');
        const data = await res.json();
        setAttraction(data);
        
        const reviewsRes = await fetch(`/api/reviews?attractionId=${params.id}`);
        let reviewsData: { reviews: Review[]; averageRating: number; totalReviews: number } = { 
          reviews: [], 
          averageRating: 0, 
          totalReviews: 0 
        };
        if (reviewsRes.ok) {
          reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews || []);
          setAverageRating(reviewsData.averageRating || 0);
          setTotalReviews(reviewsData.totalReviews || 0);
        }
        
        const userId = localStorage.getItem('userId');
        if (userId && reviewsData.reviews && reviewsData.reviews.length > 0) {
          const userReview = reviewsData.reviews.find((r: Review) => r.consumer.id === userId);
          // FIX: Verificação segura com casting
          if (userReview && typeof userReview === 'object') {
            const reviewObj = userReview as any;
            if (reviewObj.id) {
              setUserHasReviewed(true);
              setUserReviewId(reviewObj.id);
              setUserRating(reviewObj.rating);
              setUserComment(reviewObj.comment || '');
            }
          }
        }
      } catch (error) {
        console.error('Erro:', error);
        setError('Não foi possível carregar os detalhes da atração');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

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
      return `R$ ${attraction.price} (preço fechado para até ${maxCap} pessoas)`;
    }
    return `R$ ${attraction.price} / pessoa`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleAddToCart = async () => {
    if (!selectedDate || !selectedAvailability) {
      alert('Selecione uma data disponível');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/register?message=CADASTRE-SE OU FAÇA O SEU LOGIN');
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
        throw new Error(data.error || 'Erro ao adicionar ao carrinho');
      }

      alert('✅ Item adicionado ao carrinho!');
      router.push('/consumer/cart');
    } catch (error: any) {
      console.error('Erro:', error);
      setError(error.message);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleSubmitReview = async () => {
    if (userRating === 0) {
      setReviewError('Selecione uma classificação em estrelas');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
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
        throw new Error(data.error || 'Erro ao enviar avaliação');
      }

      setReviewSuccess('✅ Avaliação enviada com sucesso!');
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
        <div className="text-xl sm:text-2xl">Carregando...</div>
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
        <div className="text-xl sm:text-2xl">Atração não encontrada</div>
      </div>
    );
  }

  const imagens = attraction.images && attraction.images.length > 0 
    ? attraction.images 
    : ['/Frank/IMG_3433.JPG', '/Frank/IMG_3440.JPG', '/Frank/IMG_3445.JPG'];

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      if (isDateAvailable(date)) return 'bg-green-100 text-green-800 rounded-full';
      return 'text-gray-300 cursor-not-allowed';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/attractions" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm sm:text-base">
            ← Voltar para atrações
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <div className="lg:flex-[2]">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-6">
              <div className="relative h-64 sm:h-80 md:h-96 bg-gray-200">
                {isVideoFile(imagens[selectedImageIndex]) ? (
                  <video src={imagens[selectedImageIndex]} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={imagens[selectedImageIndex]} alt={attraction.title} className="w-full h-full object-cover" />
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
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                    {totalReviews} avaliação{totalReviews !== 1 ? 'ões' : ''}
                  </span>
                )}
              </div>

              <div className="prose max-w-none mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3">Sobre esta experiência</h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{attraction.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-4 border-t border-b">
                <div><div className="text-gray-500 text-xs sm:text-sm">Duração</div><div className="font-semibold text-sm sm:text-base">{attraction.duration || 2} horas</div></div>
                <div><div className="text-gray-500 text-xs sm:text-sm">Capacidade</div><div className="font-semibold text-sm sm:text-base">Até {attraction.maxCapacity || 10} pessoas</div></div>
                <div><div className="text-gray-500 text-xs sm:text-sm">Idiomas</div><div className="font-semibold text-sm sm:text-base">Português</div></div>
                <div><div className="text-gray-500 text-xs sm:text-sm">Cancelamento</div><div className="font-semibold text-green-600 text-sm sm:text-base">Gratuito</div></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Avaliações dos Viajantes</h2>
              
              {totalReviews === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                  <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
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
                          <p className="font-semibold text-sm sm:text-base">{review.consumer.name || 'Viajante'}</p>
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
                  <h3 className="font-semibold mb-3 text-base sm:text-lg">Avalie esta experiência</h3>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Sua nota</label><StarRating rating={userRating} onRatingChange={setUserRating} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Seu comentário (opcional)</label><textarea rows={3} value={userComment} onChange={(e) => setUserComment(e.target.value)} placeholder="Compartilhe sua experiência..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" /></div>
                    {reviewError && <div className="text-red-600 text-sm">{reviewError}</div>}
                    {reviewSuccess && <div className="text-green-600 text-sm">{reviewSuccess}</div>}
                    <button onClick={handleSubmitReview} disabled={submittingReview} className="px-5 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-gray-400 text-sm sm:text-base min-h-[44px]">{submittingReview ? 'Enviando...' : 'Enviar Avaliação'}</button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t bg-green-50 p-3 sm:p-4 rounded-lg"><p className="text-green-700 text-sm sm:text-base">✅ Você já avaliou esta atração. Obrigado pelo seu feedback!</p></div>
              )}
            </div>
          </div>

          <div className="lg:flex-1">
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 sticky top-20">
              <div className="mb-5 sm:mb-6"><div className="text-2xl sm:text-3xl font-bold text-blue-600 break-words">{formatPriceDisplay()}</div></div>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Selecione uma data</label><Calendar onChange={(value) => setSelectedDate(value as Date)} value={selectedDate} minDate={new Date()} tileClassName={tileClassName} className="rounded-lg border-0 shadow-sm w-full" locale="pt-BR" />
                {selectedDate && !selectedAvailability && <p className="text-red-500 text-sm mt-2">⚠️ Esta data não está disponível. Selecione outra data.</p>}</div>
                {selectedAvailability && <div className="bg-green-50 p-3 rounded-lg"><p className="text-green-700 text-sm font-medium">✓ Data disponível: {selectedDate ? formatDate(selectedDate) : ''}</p>{selectedAvailability.price && selectedAvailability.price !== attraction.price && <p className="text-green-600 text-sm">Preço especial: R$ {selectedAvailability.price}</p>}</div>}
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Número de participantes</label><input type="number" min="1" max={attraction.maxCapacity || 20} value={participants} onChange={(e) => setParticipants(parseInt(e.target.value) || 1)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Pedidos especiais (opcional)</label><textarea rows={3} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm sm:text-base" placeholder="Alguma alergia, restrição ou pedido especial?" /></div>
                {error && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
                <div className="border-t pt-4 mt-4"><div className="flex justify-between text-base sm:text-lg font-semibold mb-4"><span>Total</span><span className="text-blue-600">R$ {calculateTotalPrice().toFixed(2)}</span></div><button onClick={handleAddToCart} disabled={isAddingToCart || !selectedAvailability} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm sm:text-base min-h-[48px]">{isAddingToCart ? 'Adicionando...' : '🛒 Adicionar ao Carrinho'}</button><p className="text-xs text-gray-500 text-center mt-3">🔒 Cancelamento gratuito até 24h antes</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}