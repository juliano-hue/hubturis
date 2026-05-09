'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

// Lista de imagens disponíveis - todas as fotos da pasta Frank
const imagens = [
  '/Frank/IMG_3433.JPG',
  '/Frank/IMG_3434.JPG',
  '/Frank/IMG_3435.JPG',
  '/Frank/IMG_3436.JPG',
  '/Frank/IMG_3437.JPG',
  '/Frank/IMG_3438.JPG',
  '/Frank/IMG_3439.JPG',
  '/Frank/IMG_3440.JPG',
  '/Frank/IMG_3441.JPG',
  '/Frank/IMG_3442.JPG',
  '/Frank/IMG_3443.JPG',
  '/Frank/IMG_3444.JPG',
  '/Frank/IMG_3445.JPG',
  '/Frank/IMG_3446.JPG',
  '/Frank/IMG_3447.JPG',
  '/Frank/IMG_3448.JPG',
  '/Frank/IMG_3449.JPG',
  '/Frank/IMG_3450.JPG',
  '/Frank/IMG_3451.JPG',
  '/Frank/IMG_3452.JPG',
  '/Frank/IMG_3453.JPG',
  '/Frank/IMG_3454.JPG',
  '/Frank/IMG_3455.JPG',
  '/Frank/IMG_3456.JPG',
  '/Frank/IMG_5404.JPEG',
  '/Frank/IMG_5405.JPEG',
  '/Frank/IMG_8094.JPEG',
  '/Frank/IMG_8095.JPEG',
];

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params?.locale as string || 'pt';
  const t = useTranslations('login');
  const common = useTranslations('common');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [backgroundImage, setBackgroundImage] = useState(imagens[0]);

  useEffect(() => {
    const randomImageIndex = Math.floor(Math.random() * imagens.length);
    setBackgroundImage(imagens[randomImageIndex]);

    const userId = localStorage.getItem('userId');
    if (userId) {
      router.push(`/${locale}`);
    }

    const msg = searchParams.get('message');
    if (msg) {
      setMessage(msg);
    }
  }, [router, searchParams, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('invalidCredentials'));
      } else if (result?.ok) {
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        
        if (session?.user) {
          localStorage.setItem('userId', session.user.id);
          localStorage.setItem('userName', session.user.name || '');
          localStorage.setItem('userEmail', session.user.email);
          localStorage.setItem('userRole', session.user.role);

          if (session.user.role === 'PROVIDER') {
            router.push('/provider/my-attractions');
          } else if (session.user.role === 'ADMIN') {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminEmail', session.user.email);
            router.push('/admin');
          } else {
            router.push(`/${locale}/consumer`);
          }
        } else {
          router.push(`/${locale}/consumer`);
        }
      } else {
        setError(t('loginError'));
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError(t('connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center transition-all duration-1000"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${backgroundImage}')` }}
    >
      <div className="w-full max-w-md px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <Link href={`/${locale}`} className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HubTuris
            </Link>
            <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-gray-900">{t('welcomeBack')}</h2>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">{t('loginToContinue')}</p>
          </div>

          {message && (
            <div className="mb-4 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs sm:text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-sm sm:text-base"
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-sm sm:text-base pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link href={`/${locale}/forgot-password`} className="text-xs sm:text-sm text-blue-600 hover:text-blue-700">
                  {t('forgotPassword')}
                </Link>
              </div>
            </div>

            {error && (
              <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-[44px]"
            >
              {loading ? t('loggingIn') : t('signIn')}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              {t('noAccount')}{' '}
              <Link href={`/${locale}/register`} className="text-blue-600 hover:text-blue-700 font-semibold">
                {common('signUp')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-white text-xl animate-pulse">Carregando HubTuris...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}