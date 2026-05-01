import { NextRequest, NextResponse } from 'next/server';
import { prismadb } from '@/lib/prismadb';

// PUT - Atualizar uma avaliação
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Avaliação deve ser entre 1 e 5 estrelas' }, { status: 400 });
    }

    // Buscar a avaliação
    const review = await prismadb.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário é o dono da avaliação
    if (review.consumerId !== userId) {
      return NextResponse.json({ error: 'Você só pode editar suas próprias avaliações' }, { status: 403 });
    }

    // Atualizar avaliação
    const updatedReview = await prismadb.review.update({
      where: { id },
      data: {
        rating,
        comment: comment || null,
      },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    return NextResponse.json({ error: 'Erro ao atualizar avaliação' }, { status: 500 });
  }
}

// DELETE - Remover uma avaliação
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

    // Buscar a avaliação
    const review = await prismadb.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 });
    }

    // Verificar se o usuário é o dono da avaliação
    if (review.consumerId !== userId) {
      return NextResponse.json({ error: 'Você só pode remover suas próprias avaliações' }, { status: 403 });
    }

    // Remover avaliação
    await prismadb.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Avaliação removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover avaliação:', error);
    return NextResponse.json({ error: 'Erro ao remover avaliação' }, { status: 500 });
  }
}