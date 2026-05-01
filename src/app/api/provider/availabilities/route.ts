import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attractionId = searchParams.get('attractionId');

    if (!attractionId) {
      return NextResponse.json({ error: 'attractionId é obrigatório' }, { status: 400 });
    }

    const availabilities = await prismadb.availability.findMany({
      where: { attractionId },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(availabilities);
  } catch (error) {
    console.error('❌ Erro ao buscar disponibilidades:', error);
    return NextResponse.json({ error: 'Erro ao buscar disponibilidades' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { availabilities } = body;

    console.log('📅 API - Recebendo múltiplas disponibilidades:', availabilities?.length);

    if (!availabilities || availabilities.length === 0) {
      return NextResponse.json({ error: 'Nenhuma disponibilidade enviada' }, { status: 400 });
    }

    const created = await prismadb.availability.createMany({
      data: availabilities.map((item: any) => ({
        attractionId: item.attractionId,
        date: new Date(item.date),
        price: item.price || null,
        maxParticipants: item.maxParticipants || 10,
        isAvailable: true,
      })),
      skipDuplicates: true,
    });

    console.log(`✅ ${created.count} disponibilidades criadas`);
    return NextResponse.json({ success: true, count: created.count });
  } catch (error) {
    console.error('❌ Erro ao criar disponibilidades:', error);
    return NextResponse.json({ error: 'Erro ao criar disponibilidades' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attractionId = searchParams.get('attractionId');

    if (!attractionId) {
      return NextResponse.json({ error: 'attractionId é obrigatório' }, { status: 400 });
    }

    await prismadb.availability.deleteMany({
      where: { attractionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao deletar disponibilidades:', error);
    return NextResponse.json({ error: 'Erro ao deletar disponibilidades' }, { status: 500 });
  }
}