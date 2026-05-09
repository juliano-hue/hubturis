'use client';

import dynamic from 'next/dynamic';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';

const DynamicNavbar = dynamic(() => import('@/components/Navbar'), { ssr: false });

const messages: Record<string, { common: Record<string, string> }> = {
  pt: {
    common: {
      explore: 'Explorar', destinations: 'Destinos', categories: 'Categorias',
      testimonials: 'Depoimentos', signIn: 'Entrar', signUp: 'Cadastrar',
      myAccount: 'Minha Conta', logout: 'Sair', cart: 'Carrinho',
      logoutConfirm: 'Deseja realmente sair do sistema?', loading: 'Carregando...',
      seeDetails: 'Ver detalhes →', seeAll: 'Ver todas as atrações',
      about: 'Sobre', howItWorks: 'Como funciona', security: 'Segurança',
      help: 'Ajuda', terms: 'Termos', privacy: 'Privacidade',
      copyright: '© 2026 HubTuris', signOut: 'Sair',
    }
  },
  en: {
    common: {
      explore: 'Explore', destinations: 'Destinations', categories: 'Categories',
      testimonials: 'Testimonials', signIn: 'Sign in', signUp: 'Sign up',
      myAccount: 'My Account', logout: 'Logout', cart: 'Cart',
      logoutConfirm: 'Do you really want to logout?', loading: 'Loading...',
      seeDetails: 'See details →', seeAll: 'See all attractions',
      about: 'About', howItWorks: 'How it works', security: 'Security',
      help: 'Help', terms: 'Terms', privacy: 'Privacy',
      copyright: '© 2026 HubTuris', signOut: 'Logout',
    }
  },
  es: {
    common: {
      explore: 'Explorar', destinations: 'Destinos', categories: 'Categorías',
      testimonials: 'Testimonios', signIn: 'Iniciar sesión', signUp: 'Registrarse',
      myAccount: 'Mi Cuenta', logout: 'Cerrar sesión', cart: 'Carrito',
      logoutConfirm: '¿Realmente deseas salir del sistema?', loading: 'Cargando...',
      seeDetails: 'Ver detalles →', seeAll: 'Ver todas las atracciones',
      about: 'Acerca de', howItWorks: 'Cómo funciona', security: 'Seguridad',
      help: 'Ayuda', terms: 'Términos', privacy: 'Privacidad',
      copyright: '© 2026 HubTuris', signOut: 'Cerrar sesión',
    }
  },
};

export default function ClientNavbarWrapper() {
  const pathname = usePathname();
  const segment = pathname?.split('/')[1] ?? '';
  const locale = ['pt', 'en', 'es'].includes(segment) ? segment : 'pt';

  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        <DynamicNavbar />
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
