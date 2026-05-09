import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prismadb from '@/lib/prismadb';
import { rateLimit } from '@/lib/rate-limit';
import { registerSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    // 🔒 RATE LIMITING: 5 tentativas por IP a cada 15 minutos
    const limiter = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 });
    const rateLimitResponse = limiter(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await req.json();
    
    // 🔒 VALIDAÇÃO DOS DADOS COM ZOD
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { name, email, password, role = 'CONSUMER' } = validation.data;
    const ref = (body as any).ref || null;

    console.log('📝 Recebendo cadastro:', { name, email, role });

    // Verificar se usuário já existe
    const existingUser = await prismadb.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já existe com este email' }, { status: 400 });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário COM os perfis correspondentes
    const user = await prismadb.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        role: role as 'CONSUMER' | 'PROVIDER' | 'ADMIN',
        // Cria o perfil automaticamente baseado no papel do usuário
        ...(role === 'CONSUMER' && {
          consumerProfile: {
            create: {
              fullName: name || email,
              cpf: '',
              phone: '',
              address: '',
              city: '',
              state: '',
              paymentType: '',
            }
          }
        }),
        ...(role === 'PROVIDER' && {
          providerProfile: {
            create: {
              fullName: name || email,
              cpf: '',
              phone: '',
              address: '',
              city: '',
              state: '',
              zipCode: '',
              bankName: '',
              agency: '',
              accountNumber: '',
              accountType: 'CORRENTE',
              pixKey: '',
            }
          }
        })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        consumerProfile: role === 'CONSUMER',
        providerProfile: role === 'PROVIDER'
      }
    });

    // Registrar referência do promotor se houver
    if (ref) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await fetch(`${appUrl}/api/referral`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ref, userId: user.id, userRole: role }),
        });
      } catch (refError) {
        console.log('⚠️ Erro ao registrar referência:', refError);
      }
    }

    // Tentar enviar e-mail (mas não falhar se der erro)
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      await fetch(`${appUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'juliano@jrerzinger.com',
          subject: '🎉 Novo usuário cadastrado!',
          html: `<h1>Novo cadastro!</h1><p>Email: ${email}</p><p>Nome: ${name || 'Não informado'}</p>`
        })
      });
      
      console.log('✅ E-mail de notificação enviado');
    } catch (emailError) {
      const errorMessage = emailError instanceof Error ? emailError.message : 'Erro desconhecido';
      console.log('⚠️ Erro ao enviar e-mail (mas cadastro foi criado):', errorMessage);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Usuário criado com sucesso!'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erro detalhado no cadastro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ 
      error: 'Erro interno ao criar usuário',
      details: errorMessage 
    }, { status: 500 });
  }
}