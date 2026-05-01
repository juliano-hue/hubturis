import { NextRequest, NextResponse } from 'next/server';

// Credenciais válidas para acesso ao site
const VALID_CREDENTIALS = [
  { username: 'jrerzinger', password: '984698@Ju' },
  { username: 'frank', password: 'provider@123' },
  { username: 'turista', password: 'turista@t' },
  { username: 'sponsor3', password: 'sponsor@123' },
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    const isValid = VALID_CREDENTIALS.some(
      cred => cred.username === username && cred.password === password
    );
    
    if (isValid) {
      // Criar um cookie de autenticação do site
      const response = NextResponse.json({ success: true });
      
      // Cookie com expiração de 24 horas
      response.cookies.set('site_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 horas
        path: '/',
      });
      
      return response;
    }
    
    return NextResponse.json(
      { error: 'Usuário ou senha inválidos' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const isAuthenticated = request.cookies.get('site_auth')?.value === 'authenticated';
  return NextResponse.json({ authenticated: isAuthenticated });
}