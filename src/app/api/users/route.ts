// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 6 caracteres' }, { status: 400 });
    }

    // Verifica se o email já existe
    const existingUser = await prismadb.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }

    const newUser = await prismadb.user.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name ? name.trim() : null,
        password,           // ← Salvando a senha (em produção faremos hash)
        role: role || 'CONSUMER',
      },
    });

    console.log('✅ Usuário criado com sucesso:', newUser);

    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({ error: 'Erro interno ao criar usuário' }, { status: 500 });
  }
}

// GET mantido para o painel admin
export async function GET() {
  try {
    const users = await prismadb.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}