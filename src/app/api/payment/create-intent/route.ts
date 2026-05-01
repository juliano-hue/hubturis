import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PaymentService } from '@/lib/payment/payment-service';
import { CreatePaymentIntentRequest } from '@/lib/payment/types';
import prismadb from '@/lib/prismadb';

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

    // Garantir que session.user existe antes de acessar
    const userEmail = session?.user?.email || undefined;
    const userName = session?.user?.name || undefined;

    const paymentIntent = await PaymentService.createPaymentIntent({
      bookingId,
      amount,
      currency: 'BRL',
      paymentMethod,
      customerEmail: customerEmail || userEmail,
      customerName: customerName || userName,
    });

    return NextResponse.json(paymentIntent);
  } catch (error) {
    console.error('Erro ao criar intenção de pagamento:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}