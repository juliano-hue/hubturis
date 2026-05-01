import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 ID recebido:', id);
    
    const attraction = await prismadb.attraction.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
    
    if (!attraction) {
      return NextResponse.json({ error: 'Atração não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(attraction);
  } catch (error) {
    console.error('❌ ERRO DETALHADO:', error);
    return NextResponse.json({ 
      error: 'Erro interno',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    console.log('📝 Atualizando atração:', id);
    
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
    console.error('❌ Erro no PATCH:', error);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prismadb.attraction.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro no DELETE:', error);
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}