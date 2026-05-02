'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { sendEmail } from '@/lib/email';
// 🔽 COLE ESTA LINHA AQUI 🔽
export const dynamic = 'force-dynamic';

interface CartItem {
  id: string;
  date: string;
  participants: number;
  price: number;
  totalPrice: number;
  specialRequests: string | null;
  attractionId: string;
  availabilityId: string | null;
  attraction: {
    id: string;
    title: string;
    city: string;
    state: string;
    images: string[];
  };
}

export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'pt';
  const t = useTranslations('cart');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    if (!userId) {
      router.push(`/${locale}/login`);
      return;
    }
    setUserEmail(email || '');
    setUserName(name || 'Viajante');
    fetchCart();
  }, [router, locale]);

  const fetchCart = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const res = await fetch('/api/cart', {
        headers: { 'x-user-id': userId || '' },
      });
      const data = await res.json();
      setCartItems(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    const userId = localStorage.getItem('userId');
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId || '' },
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const updateQuantity = async (itemId: string, participants: number) => {
    if (participants < 1) return;
    const userId = localStorage.getItem('userId');
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || '',
        },
        body: JSON.stringify({
          participants,
          totalPrice: item.price * participants,
        }),
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };

  const handleCheckout = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push(`/${locale}/login`);
      return;
    }

    if (cartItems.length === 0) {
      setError(t('errorEmpty'));
      return;
    }

    setCheckoutLoading(true);
    setError('');

    try {
      // Criar reservas para cada item do carrinho
      const bookingPromises = cartItems.map(async (item) => {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({
            attractionId: item.attractionId,
            availabilityId: item.availabilityId,
            date: item.date,
            participants: item.participants,
            totalPrice: item.totalPrice,
            specialRequests: item.specialRequests || undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao criar reserva');
        }

        return response.json();
      });

      const bookings = await Promise.all(bookingPromises);
      
      // Processar pagamento para cada reserva
      const paymentPromises = bookings.map(async (booking) => {
        const paymentResponse = await fetch(`/api/bookings/${booking.id}/payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod }),
        });

        if (!paymentResponse.ok) {
          const data = await paymentResponse.json();
          throw new Error(data.error || 'Erro no pagamento');
        }

        return paymentResponse.json();
      });

      await Promise.all(paymentPromises);

      // Enviar e-mails de confirmação
      for (let i = 0; i < bookings.length; i++) {
        const booking = bookings[i];
        const cartItem = cartItems[i];
        await sendEmail({
          to: userEmail,
          type: 'booking_confirmation',
          bookingData: {
            id: booking.id,
            attractionTitle: cartItem.attraction.title,
            date: cartItem.date,
            participants: cartItem.participants,
            totalPrice: cartItem.totalPrice,
            userName: userName,
          },
        });
      }

      // Limpar carrinho
      const clearPromises = cartItems.map(async (item) => {
        await fetch(`/api/cart/${item.id}`, {
          method: 'DELETE',
          headers: { 'x-user-id': userId },
        });
      });
      await Promise.all(clearPromises);

      const metodoTexto = paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'PIX';
      alert(t('successMessage', { method: metodoTexto }));
      router.push(`/${locale}/consumer`);
    } catch (err: any) {
      console.error('Erro no checkout:', err);
      setError(err.message || t('errorCheckout'));
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('title')}</h1>
          <Link href={`/${locale}/attractions`} className="text-blue-600 hover:text-blue-800 text-sm sm:text-base">
            ← {t('continueShopping')}
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-center text-sm">{error}</p>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-4">🛒</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">{t('emptyTitle')}</h2>
            <p className="text-gray-500 text-sm sm:text-base mb-6">{t('emptyMessage')}</p>
            <Link
              href={`/${locale}/attractions`}
              className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-sm sm:text-base"
            >
              {t('exploreButton')}
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="w-full sm:w-32 h-48 sm:h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.attraction.images?.[0] || '/Frank/IMG_3433.JPG'}
                        alt={item.attraction.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-xl font-semibold text-gray-800 mb-1">
                        {item.attraction.title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm mb-2">
                        📍 {item.attraction.city}, {item.attraction.state}
                      </p>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3">
                        📅 {new Date(item.date).toLocaleDateString(locale === 'pt' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-ES')}
                      </p>
                      {item.specialRequests && (
                        <p className="text-gray-500 text-xs sm:text-sm italic">
                          "{item.specialRequests}"
                        </p>
                      )}
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs sm:text-sm text-gray-600">{t('participants')}:</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={item.participants}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            className="w-16 sm:w-20 px-2 sm:px-3 py-1 border rounded-lg text-center text-sm"
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{t('unitPrice')}</p>
                          <p className="text-base sm:text-lg font-semibold text-blue-600">
                            R$ {item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{t('total')}</p>
                          <p className="text-base sm:text-xl font-bold text-gray-800">
                            R$ {item.totalPrice.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition text-sm"
                        >
                          🗑️ {t('remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('summary')}</h2>
              
              {/* Opção de Pagamento */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('paymentMethod')}
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm sm:text-base">{t('creditCard')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pix"
                      checked={paymentMethod === 'pix'}
                      onChange={() => setPaymentMethod('pix')}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm sm:text-base">{t('pix')}</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 border-b pb-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>{t('subtotal')}</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600 text-sm sm:text-base">
                  <span>{t('freeCancellation')}</span>
                  <span>✓</span>
                </div>
              </div>
              <div className="flex justify-between text-lg sm:text-xl font-bold mt-4">
                <span>{t('total')}</span>
                <span className="text-blue-600">R$ {total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400 text-sm sm:text-base"
              >
                {checkoutLoading ? t('processing') : paymentMethod === 'credit_card' ? t('checkoutCard') : t('checkoutPix')}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                🔒 {t('freeCancellationBadge')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}