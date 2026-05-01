'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  date: string;
  participants: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  specialRequests: string | null;
  consumer: {
    id: string;
    name: string | null;
    email: string;
    consumerProfile: {
      fullName: string;
      phone: string;
    } | null;
  };
  attraction: {
    id: string;
    title: string;
    location: string;
    city: string;
    state: string;
  };
}

export default function ProviderBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');

    if (!userId || role !== 'PROVIDER') {
      router.push('/login');
      return;
    }

    fetch(`/api/provider/bookings?providerId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar');
        return res.json();
      })
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro:', err);
        setError('Não foi possível carregar as reservas');
        setLoading(false);
      });
  }, [router]);

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
      PENDING: 'Aguardando pagamento',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada',
      COMPLETED: 'Realizada',
      REJECTED: 'Rejeitada',
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl sm:text-2xl">Carregando reservas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Reservas das Minhas Atrações</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">
              {bookings.length === 0 
                ? 'Nenhuma reserva ainda'
                : `${bookings.length} reserva${bookings.length > 1 ? 's' : ''} realizada${bookings.length > 1 ? 's' : ''}`
              }
            </p>
          </div>
          <button
            onClick={() => router.push('/provider/my-attractions')}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base min-h-[44px]"
          >
            ← Voltar para Minhas Atrações
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-12 sm:p-20 text-center shadow-xl">
            <div className="text-5xl sm:text-6xl mb-6 sm:mb-8">📭</div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-4">Nenhuma reserva ainda</h2>
            <p className="text-gray-600 text-sm sm:text-base">Quando os consumidores contratarem suas atrações, elas aparecerão aqui.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl sm:text-2xl">🏝️</span>
                      <h3 className="text-base sm:text-xl font-semibold">{booking.attraction.title}</h3>
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3">
                      📍 {booking.attraction.city}, {booking.attraction.state}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                      <div className="bg-gray-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                        <p className="text-xs text-gray-500">Cliente</p>
                        <p className="font-medium text-sm sm:text-base">{booking.consumer.consumerProfile?.fullName || booking.consumer.name || booking.consumer.email}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{booking.consumer.consumerProfile?.phone || 'Sem telefone'}</p>
                      </div>
                      <div className="bg-gray-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                        <p className="text-xs text-gray-500">Contato</p>
                        <p className="font-medium text-sm sm:text-base break-words">{booking.consumer.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-500">Data:</span>
                        <span className="ml-1 font-medium">{new Date(booking.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Participantes:</span>
                        <span className="ml-1 font-medium">{booking.participants} pessoa(s)</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Valor total:</span>
                        <span className="ml-1 font-bold text-blue-600 text-sm sm:text-base">R$ {booking.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-3 bg-yellow-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                        <p className="text-xs text-yellow-700">Pedido especial:</p>
                        <p className="text-xs sm:text-sm">{booking.specialRequests}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus === 'PAID' ? 'Pago' : 'Pagamento pendente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}