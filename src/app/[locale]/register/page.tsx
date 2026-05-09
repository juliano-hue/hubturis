'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

type UserRole = 'CONSUMER' | 'PROVIDER';

// Imagens disponíveis na pasta atracoes-natal
const imagensDisponiveis = [
  '/atracoes-natal/Flow,_gere_para_202sss604211745.jpg',
  '/atracoes-natal/Flow,_gere_para_sss202fgdsssddszcs604211745.jpg',
  '/atracoes-natal/Flow,_gere_para_sss202fgdssss604211745.jpg',
  '/atracoes-natal/Flow,_gere_para_sss202sss604211745.jpg',
  '/atracoes-natal/Fotos_asdatraaasções_turismoasdaDF_202604211744.jpg',
  '/atracoes-natal/Fotos_asdatraaasções_turismo_202604211744.jpg',
  '/atracoes-natal/Fotos_asdatraaasções_turisSDFASmoasdaDF_202604211744.jpg',
  '/atracoes-natal/Fotos_asdatrações_turismo_202604211744.jpg',
  '/atracoes-natal/Fotos_atrações_turismo_202604211744 (1).jpeg',
  '/atracoes-natal/Fotos_atrações_turismo_202604211745.jpeg',
  '/atracoes-natal/Gere_imagens_turísticas_202604211742.jpeg',
  '/atracoes-natal/Gere_imagens_turísticas_202604211743 (1).jpeg',
  '/atracoes-natal/Gere_imagens_turísticas_202604211743.jpeg',
  '/atracoes-natal/Mitsubishi_Pajero_dune_202604211712.jpeg',
];

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations('register');
  const common = useTranslations('common');
  
  const message = searchParams.get('message');
  const ref = searchParams.get('ref') || '';
  const redirectUrl = searchParams.get('redirect') || null;
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CONSUMER');
  const [fundoIndex, setFundoIndex] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFundoIndex((prev) => (prev + 1) % imagensDisponiveis.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }

    if (!email || !password) {
      setError(t('requiredFields'));
      return;
    }

    if (!acceptedTerms) {
      setError(t('acceptTermsError'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || email.split('@')[0], email, password, role, ...(ref && { ref }) }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('registerError'));
        return;
      }

      setSuccess(t('registerSuccess'));

      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email);

      setTimeout(() => {
        if (data.user.role === 'PROVIDER') {
          router.push('/provider/profile');
        } else if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push(`/${locale}/consumer`);
        }
      }, 1500);

    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError(t('connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 bg-cover bg-center transition-all duration-1000"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${imagensDisponiveis[fundoIndex]}')` }}
      suppressHydrationWarning
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-md">
        <div className="mb-4 sm:mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-medium text-xs sm:text-sm"
          >
            ← {t('backToHome')}
          </Link>
        </div>

        {message && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-xl sm:rounded-2xl text-center">
            <p className="text-yellow-800 font-medium text-sm sm:text-base">{message}</p>
            <p className="text-yellow-600 text-xs sm:text-sm mt-1">{t('createAccountCta')}</p>
          </div>
        )}

        <div className="text-center mb-6 sm:mb-8">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">✨</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('nameLabel')}
            </label>
            <input
              type="text"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
            <p className="text-xs text-gray-400 mt-1">{t('nameHint')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('emailLabel')} *</label>
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('passwordLabel')} * ({t('passwordMinLengthHint')})</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirmPasswordLabel')} *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('roleLabel')}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base"
            >
              <option value="CONSUMER">{t('roleConsumer')}</option>
              <option value="PROVIDER">{t('roleProvider')}</option>
            </select>
          </div>

          {/* ACEITE LGPD */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
              {t('acceptTerms')}{' '}
              <Link href={`/${locale}/terms`} target="_blank" className="text-blue-600 hover:underline font-medium">
                {t('termsLink')}
              </Link>{' '}
              {t('and')}{' '}
              <Link href={`/${locale}/privacy`} target="_blank" className="text-blue-600 hover:underline font-medium">
                {t('privacyLink')}
              </Link>
              {t('acceptTermsSuffix')}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !acceptedTerms}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105 min-h-[48px]"
          >
            {loading ? t('creatingButton') : t('submitButton')}
          </button>
        </form>

        {error && <p className="text-red-600 text-center mt-4 font-medium text-sm">{error}</p>}
        {success && <p className="text-green-600 text-center mt-4 font-medium text-sm">{success}</p>}

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            {t('haveAccount')}{' '}
            <Link href={`/${locale}/login`} className="text-blue-600 font-medium hover:underline">
              {common('signIn')}
            </Link>
          </p>
        </div>

        <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {imagensDisponiveis.slice(0, 5).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                fundoIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}