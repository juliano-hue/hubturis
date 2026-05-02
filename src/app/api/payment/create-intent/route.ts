import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

// Função mock para quando Stripe/Mercado Pago não estiver configurado
async function createMockPaymentIntent(data: any) {
  console.log('🔧 Modo mock: criando intenção de pagamento simulada', data);
  return {
    id: `mock_${Date.now()}`,
    clientSecret: `mock_secret_${Date.now()}`,
    amount: data.amount,
    currency: 'BRL',
    status: 'requires_payment_method',
    mock: true
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, amount, paymentMethod, customerEmail, customerName } = body;

    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Verificar se a reserva pertence ao usuário
    const booking = await prismadb.booking.findUnique({
      where: { id: bookingId, consumerId: userId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    // Verificar se o PaymentService está disponível (Stripe/Mercado Pago configurado)
    let paymentIntent;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const mercadoPagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    const hasPaymentProvider = (stripeKey && stripeKey !== 'sk_test_placeholder') || 
                               (mercadoPagoToken && mercadoPagoToken !== 'TEST-xxxxxxxxxxxx-xxxxxx');

    if (hasPaymentProvider) {
      // Se o provider estiver configurado, usa o PaymentService real
      try {
        const { PaymentService } = await import('@/lib/payment/payment-service');
        paymentIntent = await PaymentService.createPaymentIntent({
          bookingId,
          amount,
          currency: 'BRL',
          paymentMethod,
          customerEmail: customerEmail || session?.user?.email,
          customerName: customerName || session?.user?.name,
        });
      } catch (err) {
        console.error('Erro ao carregar PaymentService, usando mock:', err);
        paymentIntent = await createMockPaymentIntent({ bookingId, amount, paymentMethod });
      }
    } else {
      // Fallback para mock
      console.log('⚠️ Nenhum provedor de pagamento configurado. Usando mock.');
      paymentIntent = await createMockPaymentIntent({ bookingId, amount, paymentMethod });
    }

    return NextResponse.json(paymentIntent);
  } catch (error) {
    console.error('Erro ao criar intenção de pagamento:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}