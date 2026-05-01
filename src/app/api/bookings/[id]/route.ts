import { NextRequest, NextResponse } from 'next/server';
import { prismadb } from '@/lib/prismadb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const booking = await prismadb.booking.findUnique({
      where: { id },
      include: {
        attraction: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            city: true,
            state: true,
            price: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    if (booking.consumerId !== userId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('Erro ao buscar reserva:', error);
    return NextResponse.json({ error: 'Erro ao buscar reserva' }, { status: 500 });
  }
}