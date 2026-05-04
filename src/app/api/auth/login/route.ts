export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { signIn } from 'next-auth/react';
import { rateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validations';

// 5 tentativas em 15 minutos
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 });

export async function POST(req: NextRequest) {
  try {
    // 🔒 RATE LIMITING
    const rateLimitResponse = limiter(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await req.json();
    
    // 🔒 VALIDAÇÃO DOS DADOS
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      console.log(`❌ Tentativa de login inválida - ${firstError.message}`);
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    console.log(`📝 Tentativa de login: ${email}`);

    // Tentar autenticar
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      console.log(`❌ Falha no login: ${email}`);
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    console.log(`✅ Login bem-sucedido: ${email}`);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}