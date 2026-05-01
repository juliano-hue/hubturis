import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  attractionId: z.string(),
  comment: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const attractionId = searchParams.get('attractionId');

    if (!attractionId) {
      return NextResponse.json({ error: 'attractionId é obrigatório' }, { status: 400 });
    }

    const reviews = await prismadb.review.findMany({
      where: { attractionId },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const averageRating = await prismadb.review.aggregate({
      where: { attractionId },
      _avg: { rating: true },
    });

    return NextResponse.json({
      reviews,
      averageRating: averageRating._avg.rating || 0,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // CORREÇÃO: Verificar se o usuário existe e tem ID
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validação manual (evitar problemas com Zod)
    const rating = body.rating;
    const attractionId = body.attractionId;
    const comment = body.comment;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Avaliação deve ser entre 1 e 5 estrelas' }, { status: 400 });
    }

    if (!attractionId || typeof attractionId !== 'string') {
      return NextResponse.json({ error: 'ID da atração é obrigatório' }, { status: 400 });
    }

    // Verificar se a atração existe
    const attraction = await prismadb.attraction.findUnique({
      where: { id: attractionId },
    });

    if (!attraction) {
      return NextResponse.json({ error: 'Atração não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário já avaliou esta atração
    const existingReview = await prismadb.review.findFirst({
      where: {
        consumerId: userId,
        attractionId,
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'Você já avaliou esta atração' }, { status: 400 });
    }

    // Criar a avaliação
    const review = await prismadb.review.create({
      data: {
        rating,
        comment: comment || null,
        consumerId: userId,
        attractionId,
      },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}