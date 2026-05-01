import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const accessLog = await prismadb.accessLog.create({
      data: {
        userId: token.id as string,
        userEmail: token.email as string,
        userRole: token.role as string,
        ip: ip,
        userAgent: userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao registrar acesso:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    // Apenas ADMIN pode ver os logs
    if (token?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const userId = searchParams.get('userId');

    const where = userId ? { userId } : {};

    const logs = await prismadb.accessLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}