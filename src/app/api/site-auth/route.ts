import { NextRequest, NextResponse } from 'next/server';

function getValidCredentials(): Array<{ username: string; password: string }> {
  const raw = process.env.SITE_AUTH_CREDENTIALS || '';
  return raw
    .split(',')
    .map((entry) => {
      const [username, ...rest] = entry.trim().split('|');
      return { username, password: rest.join('|') };
    })
    .filter((c) => c.username && c.password);
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const credentials = getValidCredentials();
    const isValid = credentials.some(
      (c) => c.username === username && c.password === password
    );

    if (isValid) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('site_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60,
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ error: 'Usuário ou senha inválidos' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const isAuthenticated = request.cookies.get('site_auth')?.value === 'authenticated';
  return NextResponse.json({ authenticated: isAuthenticated });
}
