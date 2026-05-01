// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET() {
  try {
    // Por enquanto estamos usando localStorage, então vamos buscar o userId dele
    // Em breve vamos melhorar isso com cookies ou sessions
    const userId = "temp"; // Placeholder - vamos melhorar depois

    // Por enquanto vamos retornar um mock. Depois conectaremos com autenticação real
    return NextResponse.json({
      id: "admin-temp",
      email: "admin@turishub.com",
      role: "ADMIN",
      name: "Administrador"
    });
  } catch (error) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
}