import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Rotas que NÃO devem ter locale aplicado (provider, admin, etc)
  const noLocaleRoutes = ['/provider', '/admin', '/api', '/_next', '/favicon.ico', '/logo.gif', '/Frank', '/atracoes-natal', '/uploads'];
  
  // Se for rota que DEVE PULAR o locale (não adicionar pt/en/es)
  if (noLocaleRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // ========== PROTEÇÃO DESABILITADA TEMPORARIAMENTE ==========
  // Descomente as linhas abaixo para reativar a proteção depois dos testes
  
  // Verificar autenticação
  // const isAuthenticated = request.cookies.get('site_auth')?.value === 'authenticated';
  // if (!isAuthenticated) {
  //   const loginUrl = new URL('/site-login', request.url);
  //   return NextResponse.redirect(loginUrl);
  // }
  // ===========================================================
  
  // Aplica o middleware do next-intl (i18n) APENAS para rotas normais
  const middleware = createMiddleware(routing);
  return middleware(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};