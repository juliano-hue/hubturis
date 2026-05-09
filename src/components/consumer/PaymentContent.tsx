'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Booking {
  id: string;
  date: string;
  participants: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  specialRequests: string | null;
  attraction: {
    id: string;
    title: string;
    description: string;
    location: string;
    city: string;
    state: string;
    price: number;
  };
}

interface PaymentContentProps {
  bookingId: string;
}

export default function PaymentContent({ bookingId }: PaymentContentProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');

    if (!userId || role !== 'CONSUMER') {
      router.push('/login');
      return;
    }

    fetch(`/api/bookings/${bookingId}`, {
      headers: { 'x-user-id': userId }
    })
      .then(res => {
        if (!res.ok) throw new Error('Reserva não encontrada');
        return res.json();
      })
      .then(data => {
        setBooking(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [bookingId, router]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'credit_card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        setError('Preencha todos os dados do cartão');
        return;
      }
      if (cardNumber.replace(/\D/g, '').length < 16) {
        setError('Número do cartão inválido');
        return;
      }
      if (cardCvv.replace(/\D/g, '').length < 3) {
        setError('CVV inválido');
        return;
      }
    }

    setProcessing(true);
    setError('');

    try {
      const response = await fetch(`/api/bookings/${booking?.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no pagamento');
      }

      alert('✅ Pagamento realizado com sucesso! Sua reserva está confirmada.');
      router.push('/consumer');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Carregando dados da reserva...</div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-red-600 mb-4">{error}</div>
          <Link href="/consumer" className="text-blue-600 hover:underline">
            ← Voltar para o dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">Reserva não encontrada</div>
          <Link href="/consumer" className="text-blue-600 hover:underline">
            ← Voltar para o dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (booking.paymentStatus === 'PAID') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Reserva já foi paga!</h1>
          <p className="text-gray-600 mb-6">Esta reserva já está confirmada.</p>
          <Link
            href="/consumer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Ver minhas reservas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/consumer" className="text-blue-600 hover:text-blue-800">
            ← Voltar para o dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Resumo da Reserva</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">Atração</p>
                <p className="font-semibold text-lg">{booking.attraction.title}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">Local</p>
                <p>{booking.attraction.city}, {booking.attraction.state}</p>
                <p className="text-sm text-gray-500">{booking.attraction.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Data</p>
                  <p>{new Date(booking.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Participantes</p>
                  <p>{booking.participants} pessoa(s)</p>
                </div>
              </div>

              {booking.specialRequests && (
                <div>
                  <p className="text-gray-500 text-sm">Pedidos especiais</p>
                  <p className="text-sm">{booking.specialRequests}</p>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">R$ {booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Pagamento</h2>
            
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de pagamento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 border rounded-lg text-center transition ${
                      paymentMethod === 'credit_card'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    💳 Cartão
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 border rounded-lg text-center transition ${
                      paymentMethod === 'pix'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    📱 PIX
                  </button>
                </div>
              </div>

              {paymentMethod === 'credit_card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Validade (MM/AA)
                      </label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                    🔒 Modo de teste: Use qualquer número de cartão (ex: 4111111111111111)
                  </div>
                </div>
              )}

              {paymentMethod === 'pix' && (
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">📱</div>
                  <p className="text-green-800 font-medium">Pagamento via PIX - Modo de Teste</p>
                  <p className="text-green-600 text-sm mt-1">Clique em "Confirmar Pagamento" para simular</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 p-3 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400 transition"
              >
                {processing ? 'Processando...' : `Confirmar Pagamento - R$ ${booking.totalPrice.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}