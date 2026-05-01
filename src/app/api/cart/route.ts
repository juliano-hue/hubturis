import { NextRequest, NextResponse } from 'next/server';
import { prismadb } from '@/lib/prismadb';

// GET - Listar itens do carrinho
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    // CORREÇÃO: Retorna carrinho vazio se não estiver logado (em vez de 401)
    if (!userId) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const cartItems = await prismadb.cart.findMany({
      where: { consumerId: userId },
      include: {
        attraction: {
          select: {
            id: true,
            title: true,
            description: true,
            city: true,
            state: true,
            price: true,
            pricingType: true,
            images: true,
          },
        },
        availability: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return NextResponse.json({ items: cartItems, total });
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    return NextResponse.json({ error: 'Erro ao buscar carrinho' }, { status: 500 });
  }
}

// POST - Adicionar item ao carrinho
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { attractionId, availabilityId, date, participants, totalPrice, specialRequests } = body;

    // Verificar se o item já existe no carrinho
    const existingItem = await prismadb.cart.findFirst({
      where: {
        consumerId: userId,
        attractionId,
        availabilityId: availabilityId || null,
        date: new Date(date),
      },
    });

    if (existingItem) {
      return NextResponse.json({ error: 'Item já está no carrinho' }, { status: 400 });
    }

    const cartItem = await prismadb.cart.create({
      data: {
        consumerId: userId,
        attractionId,
        availabilityId: availabilityId || null,
        date: new Date(date),
        participants,
        price: totalPrice / participants,
        totalPrice,
        specialRequests: specialRequests || null,
      },
      include: {
        attraction: {
          select: {
            id: true,
            title: true,
            city: true,
            state: true,
            images: true,
          },
        },
      },
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    return NextResponse.json({ error: 'Erro ao adicionar ao carrinho' }, { status: 500 });
  }
}