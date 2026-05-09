import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');

  if (!providerId) {
    return NextResponse.json({ error: 'providerId obrigatório' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: providerId },
      select: { planType: true, planExpiresAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const attractions = await prisma.attraction.findMany({
      where: { providerId },
      select: {
        id: true,
        title: true,
        viewCount: true,
        clickCount: true,
        featuredUntil: true,
        reviews: { select: { rating: true } },
      },
    });

    const totalViews = attractions.reduce((sum, a) => sum + a.viewCount, 0);
    const totalClicks = attractions.reduce((sum, a) => sum + a.clickCount, 0);

    return NextResponse.json({
      planType: user.planType,
      planExpiresAt: user.planExpiresAt,
      totalViews,
      totalClicks,
      attractionsCount: attractions.length,
      attractions: attractions.map(a => ({
        id: a.id,
        title: a.title,
        viewCount: a.viewCount,
        clickCount: a.clickCount,
        featuredUntil: a.featuredUntil,
        averageRating: a.reviews.length > 0
          ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length
          : 0,
        reviewCount: a.reviews.length,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, action, attractionId, days } = body;

    if (!providerId) {
      return NextResponse.json({ error: 'providerId obrigatório' }, { status: 400 });
    }

    if (action === 'boost' && attractionId && days) {
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + days);

      await prisma.attraction.update({
        where: { id: attractionId },
        data: { featuredUntil },
      });

      return NextResponse.json({ success: true, featuredUntil });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao processar plano:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
