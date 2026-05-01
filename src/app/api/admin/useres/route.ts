// src/app/api/admin/login/route.ts
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    // Busca o usuário no banco
    const user = await prismadb.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true, // Vamos comparar a senha (ainda não está hasheada)
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem entrar.' }, { status: 403 });
    }

    // Comparação simples de senha (temporária - vamos melhorar com hash depois)
    if (password !== user.password) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    // Login bem-sucedido
    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Erro no login admin:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}