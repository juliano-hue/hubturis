import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prismadb';

export async function GET() {
  try {
    const attractions = await prismadb.attraction.findMany({
      include: {
        provider: {
          select: {
            name: true,
          },
        },
        reviews: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular média para cada atração
    const attractionsWithRating = attractions.map((attraction: any) => ({
      ...attraction,
      averageRating: attraction.reviews.length > 0
        ? attraction.reviews.reduce((acc, r) => acc + r.rating, 0) / attraction.reviews.length
        : 0,
      totalReviews: attraction.reviews.length,
    }));

    return NextResponse.json(attractionsWithRating);
  } catch (error) {
    console.error('Erro ao buscar atrações:', error);
    return NextResponse.json(
      { error: 'Não foi possível carregar as atrações' },
      { status: 500 }
    );
  }
}