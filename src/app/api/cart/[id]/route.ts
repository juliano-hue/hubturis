import { NextRequest, NextResponse } from 'next/server';
import { prismadb } from '@/lib/prismadb';

// DELETE - Remover item do carrinho
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const cartItem = await prismadb.cart.findUnique({
      where: { id },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    if (cartItem.consumerId !== userId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
    }

    await prismadb.cart.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover item do carrinho:', error);
    return NextResponse.json({ error: 'Erro ao remover item' }, { status: 500 });
  }
}

// PUT - Atualizar quantidade/participantes
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id');
    const body = await request.json();
    const { participants, totalPrice } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const cartItem = await prismadb.cart.findUnique({
      where: { id },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    if (cartItem.consumerId !== userId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
    }

    const updatedItem = await prismadb.cart.update({
      where: { id },
      data: {
        participants,
        totalPrice: totalPrice || participants * cartItem.price,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Erro ao atualizar item do carrinho:', error);
    return NextResponse.json({ error: 'Erro ao atualizar item' }, { status: 500 });
  }
}