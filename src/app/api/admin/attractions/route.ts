import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET() {
  try {
    const attractions = await prismadb.attraction.findMany({
      include: {
        provider: { select: { id: true, name: true, email: true, planType: true } },
        reviews: { select: { rating: true } },
        bookings: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = attractions.map(a => ({
      ...a,
      averageRating: a.reviews.length > 0
        ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length
        : 0,
      totalReviews: a.reviews.length,
      totalBookings: a.bookings.length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
