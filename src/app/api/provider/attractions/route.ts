import { NextRequest, NextResponse } from 'next/server';
import { prismadb } from '@/lib/prismadb';

export async function GET(request: NextRequest) {
  try {
    const providerId = request.nextUrl.searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json({ error: 'providerId é obrigatório' }, { status: 400 });
    }

    const attractions = await prismadb.attraction.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ attractions });
  } catch (error: any) {
    console.error('Erro ao buscar atrações:', error);
    return NextResponse.json({ error: 'Erro ao buscar atrações' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      description,
      location,
      city,
      state,
      price,
      duration,
      maxCapacity,
      category,
      providerId
    } = body;

    if (!title || !description || !location || !city || !state || !price || !providerId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não foram preenchidos' },
        { status: 400 }
      );
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Preço deve ser um valor positivo' },
        { status: 400 }
      );
    }

    const attraction = await prismadb.attraction.create({
      data: {
        title,
        description,
        location,
        city,
        state,
        price: parseFloat(price),
        duration: duration ? parseInt(duration) : null,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        category: category || null,
        providerId,
      },
      include: {
        provider: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Atração cadastrada com sucesso!',
      attraction
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao cadastrar atração:', error);
    return NextResponse.json({
      error: 'Erro interno ao cadastrar a atração. Tente novamente.'
    }, { status: 500 });
  }
}