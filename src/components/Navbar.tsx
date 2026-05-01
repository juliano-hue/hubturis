'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoExists, setLogoExists] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const t = useTranslations('common');

  const isLoggedIn = status === 'authenticated';
  const user = session?.user as any;
  const userRole = user?.role;
  const isConsumer = userRole === 'CONSUMER';
  const isProvider = userRole === 'PROVIDER';
  const userId = user?.id;
  
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  
  const switchLanguage = (newLocale: string) => {
    let currentPath = pathname;
    const localePattern = new RegExp(`^/(${routing.locales.join('|')})`);
    const pathWithoutLocale = currentPath.replace(localePattern, '');
    const newPath = pathWithoutLocale || '';
    const newUrl = `/${newLocale}${newPath}`;
    router.push(newUrl);
  };
  
  useEffect(() => {
    fetch('/logo.gif')
      .then(res => res.ok && setLogoExists(true))
      .catch(() => setLogoExists(false));
  }, []);
  
  useEffect(() => {
    if (isLoggedIn && isConsumer && userId) {
      fetch(`/api/cart?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setCartCount(data.length);
        })
        .catch(console.error);
    } else {
      setCartCount(0);
    }
  }, [isLoggedIn, isConsumer, userId]);
  
  const handleLogout = async () => {
    if (confirm(t('logoutConfirm') || 'Deseja realmente sair do sistema?')) {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=');
        if (name.trim()) {
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      setCartCount(0);
      await signOut({ redirect: false });
      window.location.href = '/';
    }
  };
  
  const getDashboardLink = () => {
    if (userRole === 'PROVIDER') return '/provider/my-attractions';
    if (userRole === 'ADMIN') return '/admin';
    return '/consumer';
  };

  const [isSiteAuthenticated, setIsSiteAuthenticated] = useState(false);
  
  useEffect(() => {
    fetch('/api/site-auth')
      .then(res => res.json())
      .then(data => setIsSiteAuthenticated(data.authenticated))
      .catch(() => setIsSiteAuthenticated(false));
  }, []);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href={isProvider ? '/provider/my-attractions' : `/${locale}`} className="flex items-center">
              {logoExists ? (
                <img src="/logo.gif" alt="HubTuris" className="h-10 md:h-12 w-auto object-contain" />
              ) : (
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HubTuris
                </span>
              )}
            </Link>
            
            {isSiteAuthenticated && (
              <button
                onClick={async () => {
                  await fetch('/api/site-logout', { method: 'POST' });
                  window.location.href = '/';
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-full transition flex items-center gap-1"
                title="Sair do sistema"
              >
                🚪 Sair
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href={isProvider ? '/provider/my-attractions' : `/${locale}/attractions`} className="text-gray-700 hover:text-blue-600 transition">
              {t('explore')}
            </Link>
            <a href="#destinos" className="text-gray-700 hover:text-blue-600 transition">
              {t('destinations')}
            </a>
            <a href="#categorias" className="text-gray-700 hover:text-blue-600 transition">
              {t('categories')}
            </a>
            <a href="#depoimentos" className="text-gray-700 hover:text-blue-600 transition">
              {t('testimonials')}
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {isConsumer && (
                  <Link href={`/${locale}/consumer/cart`} className="relative">
                    <span className="text-xl">🛒</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link href={getDashboardLink()} className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition">
                  {t('myAccount')}
                </Link>
                <button onClick={handleLogout} className="px-4 py-2 border border-red-500 text-red-500 rounded-full text-sm hover:bg-red-50 transition">
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`} className="text-gray-700 hover:text-blue-600 transition">
                  {t('signIn')}
                </Link>
                <Link href={`/${locale}/register`} className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition">
                  {t('signUp')}
                </Link>
              </>
            )}
            
            {!isProvider && (
              <div className="flex items-center gap-1 ml-2 border-l pl-3 border-gray-200">
                <button onClick={() => switchLanguage('pt')} className={`px-2 py-1 rounded text-xs font-medium uppercase transition ${locale === 'pt' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  PT
                </button>
                <button onClick={() => switchLanguage('en')} className={`px-2 py-1 rounded text-xs font-medium uppercase transition ${locale === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  EN
                </button>
                <button onClick={() => switchLanguage('es')} className={`px-2 py-1 rounded text-xs font-medium uppercase transition ${locale === 'es' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  ES
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t space-y-3 pb-3">
            <Link href={isProvider ? '/provider/my-attractions' : `/${locale}/attractions`} className="block text-gray-700 hover:text-blue-600 py-2" onClick={() => setMenuOpen(false)}>
              {t('explore')}
            </Link>
            <a href="#destinos" className="block text-gray-700 hover:text-blue-600 py-2" onClick={() => setMenuOpen(false)}>
              {t('destinations')}
            </a>
            <a href="#categorias" className="block text-gray-700 hover:text-blue-600 py-2" onClick={() => setMenuOpen(false)}>
              {t('categories')}
            </a>
            <a href="#depoimentos" className="block text-gray-700 hover:text-blue-600 py-2" onClick={() => setMenuOpen(false)}>
              {t('testimonials')}
            </a>
            
            {isLoggedIn ? (
              <>
                {isConsumer && (
                  <Link href={`/${locale}/consumer/cart`} className="flex items-center gap-2 text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
                    🛒 {t('cart')}
                    {cartCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link href={getDashboardLink()} className="block text-blue-600 font-semibold py-2" onClick={() => setMenuOpen(false)}>
                  {t('myAccount')}
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left text-red-500 py-2">
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/login`} className="block text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
                  {t('signIn')}
                </Link>
                <Link href={`/${locale}/register`} className="block text-blue-600 font-semibold py-2" onClick={() => setMenuOpen(false)}>
                  {t('signUp')}
                </Link>
              </>
            )}
            
            {isSiteAuthenticated && (
              <button
                onClick={async () => {
                  await fetch('/api/site-logout', { method: 'POST' });
                  window.location.href = '/';
                }}
                className="block w-full text-left text-red-600 font-semibold py-2 border-t mt-2 pt-2"
              >
                🚪 Sair do Site
              </button>
            )}
            
            {!isProvider && (
              <div className="flex items-center justify-center gap-3 pt-2 border-t mt-2">
                <button onClick={() => { switchLanguage('pt'); setMenuOpen(false); }} className="px-3 py-1 rounded text-sm font-medium uppercase bg-gray-100 text-gray-700">
                  PT
                </button>
                <button onClick={() => { switchLanguage('en'); setMenuOpen(false); }} className="px-3 py-1 rounded text-sm font-medium uppercase bg-gray-100 text-gray-700">
                  EN
                </button>
                <button onClick={() => { switchLanguage('es'); setMenuOpen(false); }} className="px-3 py-1 rounded text-sm font-medium uppercase bg-gray-100 text-gray-700">
                  ES
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}