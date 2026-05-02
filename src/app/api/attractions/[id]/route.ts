import { NextRequest, NextResponse } from 'next/server';
import { prismadb } from '@/lib/prismadb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID da atração é obrigatório' }, { status: 400 });
    }

    const attraction = await prismadb.attraction.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        availabilities: true,
        reviews: {
          include: {
            consumer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!attraction) {
      return NextResponse.json({ error: 'Atração não encontrada' }, { status: 404 });
    }

    // Calcular média das avaliações
    const averageRating = attraction.reviews.length > 0
      ? attraction.reviews.reduce((acc: number, r) => acc + r.rating, 0) / attraction.reviews.length
      : 0;

    // Garantir que images seja sempre um array
    const response = {
      ...attraction,
      images: attraction.images || [],
      averageRating,
      totalReviews: attraction.reviews.length,
    };

    console.log('📸 Atração carregada:', response.id, '| Avaliações:', response.totalReviews);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Erro ao buscar atração por ID:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}