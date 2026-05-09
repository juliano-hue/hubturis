import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET() {
  try {
    const users = await prismadb.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        planType: true,
        createdAt: true,
        providerProfile: { select: { fullName: true, phone: true, city: true, state: true } },
        consumerProfile: { select: { fullName: true, phone: true, city: true } },
        attractions: { select: { id: true } },
        bookings: { select: { id: true, totalPrice: true, paymentStatus: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = users.map(u => ({
      ...u,
      totalAttractions: u.attractions.length,
      totalBookings: u.bookings.length,
      totalSpent: u.bookings
        .filter(b => b.paymentStatus === 'PAID')
        .reduce((s, b) => s + b.totalPrice, 0),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    await prismadb.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, planType } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    const user = await prismadb.user.update({
      where: { id },
      data: { ...(planType && { planType }) },
      select: { id: true, email: true, planType: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}
