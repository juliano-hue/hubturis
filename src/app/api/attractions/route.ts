import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { calcAttractionScore } from '@/lib/plans';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const city = searchParams.get('city');
    const category = searchParams.get('category');

    // Construir filtro
    const where: any = {};

    if (providerId) {
      where.providerId = providerId;
    }

    if (city && city !== 'all') {
      where.city = city;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    const attractions = await prismadb.attraction.findMany({
      where,
      include: {
        reviews: { select: { rating: true, createdAt: true } },
        provider: { select: { name: true, email: true, planType: true } },
      },
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const attractionsWithRating = attractions.map((attraction: any) => {
      const averageRating = attraction.reviews.length > 0
        ? attraction.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / attraction.reviews.length
        : 0;
      const hasRecentReview = attraction.reviews.some((r: any) => new Date(r.createdAt) > sevenDaysAgo);
      const score = calcAttractionScore({
        planType: attraction.provider?.planType || 'BRONZE',
        averageRating,
        featuredUntil: attraction.featuredUntil,
        createdAt: attraction.createdAt,
        hasRecentReview,
      });
      return {
        ...attraction,
        averageRating,
        totalReviews: attraction.reviews.length,
        isBoosted: attraction.featuredUntil && attraction.featuredUntil > now,
        score,
      };
    });

    // Se não filtrado por provider, ordena por score
    if (!providerId) {
      attractionsWithRating.sort((a: any, b: any) => b.score - a.score);
    }

    return NextResponse.json(attractionsWithRating);
  } catch (error) {
    console.error('Erro ao buscar atrações:', error);
    return NextResponse.json({ error: 'Erro ao buscar atrações' }, { status: 500 });
  }
}