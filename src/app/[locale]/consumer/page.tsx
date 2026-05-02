'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

interface Booking {
  id: string;
  date: string;
  participants: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  attraction: {
    id: string;
    title: string;
    location: string;
    city: string;
    state: string;
    price: number;
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

export default function ConsumerDashboard() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'pt';
  const t = useTranslations('consumer');
  const common = useTranslations('common');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [fundoIndex, setFundoIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadBookings = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    try {
      const res = await fetch(`/api/bookings?userId=${userId}`, {
        headers: { 'x-user-id': userId }
      });
      const data = await res.json();
      const novasReservas = Array.isArray(data) ? data : [];
      setBookings(novasReservas);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      setBookings([]);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFundoIndex((prev) => (prev + 1) % imagensDisponiveis.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (!userId || role !== 'CONSUMER') {
      router.push(`/${locale}/login`);
      return;
    }

    if (name) setUserName(name);

    fetch(`/api/consumer/profile?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.profile?.fullName) setUserName(data.profile.fullName);
      })
      .catch(console.error);

    loadBookings().finally(() => setLoading(false));
  }, [router, locale, loadBookings, refreshKey]);

  const handleCancelBooking = async (bookingId: string, bookingDate: string) => {
    const now = new Date();
    const eventDate = new Date(bookingDate);
    const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      alert(t('cancelNotAllowed'));
      return;
    }
    
    if (!confirm(t('cancelConfirm'))) {
      return;
    }
    
    const userId = localStorage.getItem('userId');
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'x-user-id': userId || '' },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('cancelError'));
      }
      
      alert(t('cancelSuccess'));
      
      await loadBookings();
      setRefreshKey(prev => prev + 1);
      
    } catch (err: any) {
      console.error('Erro:', err);
      alert(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: t('status.pending'),
      CONFIRMED: t('status.confirmed'),
      CANCELLED: t('status.cancelled'),
      COMPLETED: t('status.completed'),
      REJECTED: t('status.rejected'),
    };
    return texts[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-orange-100 text-orange-800',
      PAID: 'bg-green-100 text-green-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: t('payment.pending'),
      PAID: t('payment.paid'),
      REFUNDED: t('payment.refunded'),
      FAILED: t('payment.failed'),
    };
    return texts[status] || status;
  };

  const totalGasto = bookings.reduce((sum, b) => {
    if (b.status === 'CONFIRMED' && b.paymentStatus === 'PAID') {
      return sum + b.totalPrice;
    }
    return sum;
  }, 0);
  
  const reservasConfirmadas = bookings.filter(b => b.status === 'CONFIRMED' && b.paymentStatus === 'PAID').length;
  const totalReservas = bookings.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl sm:text-7xl mb-4 sm:mb-6 animate-bounce">🏖️</div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-base sm:text-xl text-gray-600 font-medium">{common('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <div 
        className="relative h-[40vh] sm:h-[50vh] min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center text-white bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${imagensDisponiveis[fundoIndex]}')` }}
      >
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-2 mb-4 sm:mb-6">
            <span className="text-yellow-400 text-sm">⭐</span>
            <span className="text-xs sm:text-sm font-medium">{t('welcomeBack')}</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
            {t('greeting', { name: userName || t('traveler') })} 👋
          </h1>
          <p className="text-base sm:text-xl text-gray-200 mb-6 sm:mb-8">
            {totalReservas === 0 
              ? t('noBookingsYet')
              : t('experiencesCount', { count: totalReservas })}
          </p>
          
          <div className="flex justify-center">
            <Link
              href={`/${locale}/attractions`}
              className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-base sm:text-xl font-bold rounded-full transition-all duration-300 shadow-2xl hover:shadow-xl transform hover:scale-105 min-h-[48px]"
            >
              🌟 {t('exploreNew')} 🌟
            </Link>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO RÁPIDA - BOTÕES MAIORES E SEM O BOTÃO SAIR */}
      <div className="relative py-4 sm:py-5 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href={`/${locale}/attractions`}
              className="px-5 sm:px-7 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2 text-base min-h-[48px]"
            >
              🏖️ {common('explore')}
            </Link>
            <Link
              href={`/${locale}/consumer/favorites`}
              className="px-5 sm:px-7 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-xl font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2 text-base min-h-[48px]"
            >
              ❤️ {t('favorites')}
            </Link>
            <Link
              href={`/${locale}/consumer/profile`}
              className="px-5 sm:px-7 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2 text-base min-h-[48px]"
            >
              👤 Perfil
            </Link>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg transform hover:-translate-y-1 transition duration-300">
            <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">🎫</div>
            <div className="text-2xl sm:text-3xl font-bold">{totalReservas}</div>
            <div className="text-blue-100 text-sm sm:text-base">{t('totalBookings')}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg transform hover:-translate-y-1 transition duration-300">
            <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">✅</div>
            <div className="text-2xl sm:text-3xl font-bold">{reservasConfirmadas}</div>
            <div className="text-green-100 text-sm sm:text-base">{t('confirmedBookings')}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg transform hover:-translate-y-1 transition duration-300">
            <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">💰</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
              {totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="text-purple-100 text-sm sm:text-base">{t('totalSpent')}</div>
          </div>
        </div>

        {/* MINHAS CONTRATAÇÕES */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 sm:px-6 py-4 sm:py-5">
            <h3 className="text-xl sm:text-2xl font-semibold text-white">{t('myBookings')}</h3>
            <p className="text-gray-300 text-xs sm:text-sm mt-1">{t('manageBookings')}</p>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 sm:p-16 text-center">
              <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🎯</div>
              <h4 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3">{t('emptyBookings')}</h4>
              <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
                {t('emptyBookingsMessage')}
              </p>
              <Link
                href={`/${locale}/attractions`}
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base min-h-[44px]"
              >
                🌟 {t('exploreNow')}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-4 sm:p-6 hover:bg-gray-50 transition duration-300">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <span className="text-2xl sm:text-3xl">🏝️</span>
                        <h4 className="text-base sm:text-xl font-semibold text-gray-800 break-words">
                          {booking.attraction.title}
                        </h4>
                      </div>
                      <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1">
                        <span>📍</span> {booking.attraction.city}, {booking.attraction.state}
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3">
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs sm:text-sm">
                          <span>📅</span>
                          <span>{new Date(booking.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs sm:text-sm">
                          <span>👥</span>
                          {t('participants')}
                        </div>
                        <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold text-xs sm:text-sm">
                          <span>💰</span>
                          <span>{booking.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {getPaymentStatusText(booking.paymentStatus)}
                        </span>
                      </div>
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id, booking.date)}
                          className="text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-medium transition min-h-[36px]"
                        >
                          {t('cancelBooking')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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