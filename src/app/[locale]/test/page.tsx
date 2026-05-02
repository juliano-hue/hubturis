'use client';
export const dynamic = 'force-dynamic';

import { useTranslations, useLocale } from 'next-intl';

export default function TestPage() {
  const t = useTranslations('common');
  const locale = useLocale();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">🧪 Teste de Internacionalização</h1>
        
        <div className="space-y-3 text-left">
          <p className="mb-2">
            <strong className="text-blue-600">Locale atual:</strong> 
            <span className="ml-2 text-lg font-mono">{locale}</span>
          </p>
          <p className="mb-2">
            <strong className="text-blue-600">Texto traduzido (explore):</strong> 
            <span className="ml-2">{t('explore')}</span>
          </p>
          <p className="mb-2">
            <strong className="text-blue-600">Texto traduzido (signIn):</strong> 
            <span className="ml-2">{t('signIn')}</span>
          </p>
          <p className="mb-2">
            <strong className="text-blue-600">Texto traduzido (copyright):</strong> 
            <span className="ml-2">{t('copyright')}</span>
          </p>
        </div>
        
        <div className="mt-6 pt-4 border-t text-gray-500 text-sm">
          <p>URL atual: {typeof window !== 'undefined' ? window.location.pathname : ''}</p>
        </div>
      </div>
    </div>
  );
}