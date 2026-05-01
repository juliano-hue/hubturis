import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Remover o cookie de autenticação
  response.cookies.set('site_auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // Expira imediatamente
    path: '/',
  });
  
  return response;
}