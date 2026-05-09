// src/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './i18n/routing'; // Caminho relativo ajustado para src/navigation.ts -> src/i18n/routing.ts

// Definimos os pathnames como um OBJETO, onde as chaves são os pathnames "neutros"
// e os valores são os pathnames localizados (ou o mesmo se não houver tradução específica).
// Este objeto 'pathnames' será usado para configurar a navegação.
export const pathnames = { // Exportamos pathnames para ser usado no .d.ts
  '/': '/',
  '/attractions': '/attractions',
  '/login': '/login',
  '/register': '/register',
  '/consumer/cart': '/consumer/cart',
  '/provider/dashboard': '/provider/dashboard',
  '/provider/my-attractions': '/provider/my-attractions',
  '/provider/attractions/new': '/provider/attractions/new',
  '/provider/bookings': '/provider/bookings',
  '/admin': '/admin',
  '/consumer': '/consumer',
  // Exemplo de pathname com tradução:
  // '/about': {
  //   pt: '/sobre',
  //   en: '/about',
  //   es: '/acerca-de',
  // },
} as const;

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: routing.locales,
  pathnames: pathnames,
  // Se você tiver um localePrefix diferente de 'always', você o adicionaria aqui:
  // localePrefix: 'as-needed', // Exemplo
});