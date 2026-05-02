import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

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
        reviews: {
          select: {
            rating: true,
          },
        },
        provider: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular média para cada atração
    const attractionsWithRating = attractions.map((attraction: any) => ({
      ...attraction,
      averageRating: attraction.reviews.length > 0
        ? attraction.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / attraction.reviews.length
        : 0,
      totalReviews: attraction.reviews.length,
    }));

    return NextResponse.json(attractionsWithRating);
  } catch (error) {
    console.error('Erro ao buscar atrações:', error);
    return NextResponse.json({ error: 'Erro ao buscar atrações' }, { status: 500 });
  }
}