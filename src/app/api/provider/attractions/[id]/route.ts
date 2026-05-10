import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const attraction = await prismadb.attraction.findUnique({
      where: { id },
      include: {
        provider: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!attraction) {
      return NextResponse.json({ error: 'Atração não encontrada' }, { status: 404 });
    }

    return NextResponse.json(attraction);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

async function getRequestUserId(req: NextRequest): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id || req.headers.get('x-user-id') || null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getRequestUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verifica se a atração pertence ao provider logado
    const existing = await prismadb.attraction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Atração não encontrada' }, { status: 404 });
    }
    if (existing.providerId !== userId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();

    const attraction = await prismadb.attraction.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        city: body.city,
        state: body.state,
        price: parseFloat(body.price),
        pricingType: body.pricingType,
        duration: body.duration ? parseInt(body.duration) : null,
        maxCapacity: body.maxCapacity ? parseInt(body.maxCapacity) : null,
        category: body.category || null,
        images: body.images || [],
      },
    });

    return NextResponse.json(attraction);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getRequestUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verifica se a atração pertence ao provider logado
    const existing = await prismadb.attraction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Atração não encontrada' }, { status: 404 });
    }
    if (existing.providerId !== userId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    await prismadb.attraction.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}
