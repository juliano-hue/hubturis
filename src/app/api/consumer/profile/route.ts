import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // CORREÇÃO: Verificar se o usuário existe e tem ID
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const consumer = await prismadb.consumerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      }
    });

    return NextResponse.json(consumer || { user: (session?.user as any) });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}