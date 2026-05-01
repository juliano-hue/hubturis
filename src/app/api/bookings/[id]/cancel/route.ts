import { NextRequest, NextResponse } from 'next/server';
import { prismadb } from '@/lib/prismadb';
import { sendEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Buscar a reserva com informações do usuário e atração
    const booking = await prismadb.booking.findUnique({
      where: { id },
      include: {
        consumer: true,
        attraction: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário é o dono da reserva
    if (booking.consumerId !== userId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
    }

    // Verificar se a reserva já está cancelada
    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Reserva já está cancelada' }, { status: 400 });
    }

    // Verificar se a reserva já foi realizada
    if (booking.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Reserva já realizada, não pode ser cancelada' }, { status: 400 });
    }

    // Verificar regra de 24 horas de antecedência
    const now = new Date();
    const eventDate = new Date(booking.date);
    const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      return NextResponse.json(
        { error: 'Cancelamento permitido apenas com 24 horas de antecedência' },
        { status: 400 }
      );
    }

    // Cancelar a reserva
    const updatedBooking = await prismadb.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED',
      },
    });

    // Converter a data para string ISO antes de enviar
    const dateString = booking.date instanceof Date ? booking.date.toISOString() : new Date(booking.date).toISOString();

    // Enviar e-mail de cancelamento
    await sendEmail({
      to: booking.consumer.email,
      type: 'booking_cancelled',
      bookingData: {
        id: booking.id,
        attractionTitle: booking.attraction.title,
        date: dateString,
        participants: booking.participants,
        totalPrice: booking.totalPrice,
        userName: booking.consumer.name || 'Viajante',
      },
    });

    logger.info(`Reserva ${id} cancelada pelo usuário ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Reserva cancelada com sucesso',
      booking: updatedBooking,
    });
  } catch (error: any) {
    logger.error('Erro ao cancelar reserva', { error });
    return NextResponse.json({ error: 'Erro ao cancelar reserva' }, { status: 500 });
  }
}