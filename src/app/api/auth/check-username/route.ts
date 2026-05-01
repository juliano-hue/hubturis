import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Nome de usuário inválido.' },
        { status: 400 }
      );
    }

    const nameTrim = name.trim();

    if (nameTrim.length < 3) {
      return NextResponse.json(
        { error: 'O login deve ter no mínimo 3 caracteres.' },
        { status: 400 }
      );
    }

    // Correção: Usar findFirst ao invés de findUnique porque 'name' não é Unique no schema
    const existingUser = await prismadb.user.findFirst({
      where: { name: nameTrim },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json({
        available: false,
        message: 'Este login já está em uso.'
      });
    }

    return NextResponse.json({
      available: true,
      message: 'Login disponível! Você pode continuar o cadastro.'
    });

  } catch (error: any) {
    console.error('Erro ao verificar username:', error);
    return NextResponse.json(
      { error: 'Erro interno ao verificar login.' },
      { status: 500 }
    );
  }
}