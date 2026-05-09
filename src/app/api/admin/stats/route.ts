import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET() {
  try {
    const [totalUsers, totalProviders, totalConsumers, totalAttractions, totalBookings, bookings] = await Promise.all([
      prismadb.user.count(),
      prismadb.user.count({ where: { role: 'PROVIDER' } }),
      prismadb.user.count({ where: { role: 'CONSUMER' } }),
      prismadb.attraction.count(),
      prismadb.booking.count(),
      prismadb.booking.findMany({ select: { totalPrice: true, status: true, paymentStatus: true, createdAt: true } }),
    ]);

    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const bookingsThisMonth = bookings.filter(b => new Date(b.createdAt) >= thisMonth).length;

    const [planBronze, planSilver, planGold] = await Promise.all([
      prismadb.user.count({ where: { role: 'PROVIDER', planType: 'BRONZE' } }),
      prismadb.user.count({ where: { role: 'PROVIDER', planType: 'SILVER' } }),
      prismadb.user.count({ where: { role: 'PROVIDER', planType: 'GOLD' } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalProviders,
      totalConsumers,
      totalAttractions,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      bookingsThisMonth,
      totalRevenue,
      platformCommission: totalRevenue * 0.1,
      plans: { bronze: planBronze, silver: planSilver, gold: planGold },
    });
  } catch (error) {
    console.error('Erro stats admin:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
