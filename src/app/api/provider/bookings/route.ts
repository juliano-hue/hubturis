import { NextRequest, NextResponse } from 'next/server';
import { prismadb } from '@/lib/prismadb';

export async function GET(request: NextRequest) {
  try {
    const providerId = request.nextUrl.searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json({ error: 'providerId é obrigatório' }, { status: 400 });
    }

    // Buscar todas as atrações do provider
    const attractions = await prismadb.attraction.findMany({
      where: { providerId },
      select: { id: true }
    });

    const attractionIds = attractions.map(a => a.id);

    if (attractionIds.length === 0) {
      return NextResponse.json([]);
    }

    // Buscar todas as reservas dessas atrações
    const bookings = await prismadb.booking.findMany({
      where: {
        attractionId: { in: attractionIds }
      },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            email: true,
            consumerProfile: {
              select: {
                fullName: true,
                phone: true
              }
            }
          }
        },
        attraction: {
          select: {
            id: true,
            title: true,
            location: true,
            city: true,
            state: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Erro ao buscar reservas do provider:', error);
    return NextResponse.json({ error: 'Erro ao buscar reservas' }, { status: 500 });
  }
}