import { NextRequest, NextResponse } from 'next/server';
import { prismadb } from '@/lib/prismadb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { paymentMethod } = await request.json();

    const booking = await prismadb.booking.findUnique({
      where: { id },
      include: { 
        consumer: true,
        attraction: true
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Reserva já foi paga' }, { status: 400 });
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'Reserva não está disponível para pagamento' }, { status: 400 });
    }

    // Simulação de pagamento (sempre aprovado para teste)
    const paymentSuccess = true;
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    if (!paymentSuccess) {
      await prismadb.booking.update({
        where: { id },
        data: { paymentStatus: 'FAILED' },
      });
      
      return NextResponse.json({ error: 'Falha no pagamento. Tente novamente.' }, { status: 400 });
    }

    const updatedBooking = await prismadb.booking.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pagamento realizado com sucesso!',
      paymentId: paymentId,
      paymentMethod: paymentMethod,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error('Erro no pagamento:', error);
    return NextResponse.json({ error: 'Erro ao processar pagamento' }, { status: 500 });
  }
}