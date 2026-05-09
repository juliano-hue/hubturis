import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET() {
  try {
    const bookings = await prismadb.booking.findMany({
      include: {
        consumer: { select: { id: true, name: true, email: true } },
        attraction: { select: { id: true, title: true, city: true, provider: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
