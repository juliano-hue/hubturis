import { NextRequest, NextResponse } from 'next/server';
import { prismadb } from '@/lib/prismadb';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const favorites = await prismadb.favorite.findMany({
      where: { consumerId: userId },
      include: {
        attraction: {
          include: {
            provider: {
              select: { name: true },
            },
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const favoritesWithRating = favorites.map((fav: any) => ({
      ...fav,
      attraction: {
        ...fav.attraction,
        averageRating: fav.attraction.reviews.length > 0
          ? fav.attraction.reviews.reduce((acc, r) => acc + r.rating, 0) / fav.attraction.reviews.length
          : 0,
        totalReviews: fav.attraction.reviews.length,
      },
    }));

    return NextResponse.json(favoritesWithRating);
  } catch (error) {
    logger.error('Erro ao buscar favoritos', { error });
    return NextResponse.json({ error: 'Erro ao buscar favoritos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { attractionId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    if (!attractionId) {
      return NextResponse.json({ error: 'attractionId é obrigatório' }, { status: 400 });
    }

    const existing = await prismadb.favorite.findUnique({
      where: {
        consumerId_attractionId: {
          consumerId: userId,
          attractionId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Atração já está nos favoritos' }, { status: 400 });
    }

    const favorite = await prismadb.favorite.create({
      data: {
        consumerId: userId,
        attractionId,
      },
    });

    logger.info(`Favorito adicionado: ${userId} - ${attractionId}`);

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    logger.error('Erro ao adicionar favorito', { error });
    return NextResponse.json({ error: 'Erro ao adicionar favorito' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const attractionId = searchParams.get('attractionId');

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    if (!attractionId) {
      return NextResponse.json({ error: 'attractionId é obrigatório' }, { status: 400 });
    }

    await prismadb.favorite.delete({
      where: {
        consumerId_attractionId: {
          consumerId: userId,
          attractionId,
        },
      },
    });

    logger.info(`Favorito removido: ${userId} - ${attractionId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Erro ao remover favorito', { error });
    return NextResponse.json({ error: 'Erro ao remover favorito' }, { status: 500 });
  }
}