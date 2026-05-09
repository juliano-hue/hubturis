import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: 'always'
});

const PUBLIC_ORIGIN = 'https://hubturis.com.br';

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Fix redirect URLs that include internal port (e.g. :3000)
  if (response && [301, 302, 307, 308].includes(response.status)) {
    const location = response.headers.get('location');
    if (location && /:\d{4,5}\//.test(location)) {
      const url = new URL(location);
      const fixed = `${PUBLIC_ORIGIN}${url.pathname}${url.search}${url.hash}`;
      const newResponse = NextResponse.redirect(fixed, { status: response.status });
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'location') newResponse.headers.set(key, value);
      });
      return newResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/(pt|en|es)/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/attractions',
    '/attractions/:path*',
    '/consumer',
    '/consumer/:path*'
  ]
};
