'use client';

import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('pwa-dismissed')) return;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in navigator) && (navigator as any).standalone;

    if (isIOS && !isInStandaloneMode) {
      setShowIOS(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroid(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowAndroid(false);
      localStorage.setItem('pwa-dismissed', '1');
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShowAndroid(false);
    setShowIOS(false);
    setDismissed(true);
    localStorage.setItem('pwa-dismissed', '1');
  };

  if (dismissed || (!showAndroid && !showIOS)) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <img src="/favicon.png" alt="HubTuris" className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">Instalar HubTuris</p>
            {showAndroid && (
              <p className="text-gray-500 text-xs mt-0.5">
                Adicione à tela inicial e use como um app — sem precisar da loja!
              </p>
            )}
            {showIOS && (
              <p className="text-gray-500 text-xs mt-0.5">
                Toque em <strong>Compartilhar</strong> <span>⬆️</span> e depois <strong>"Adicionar à Tela de Início"</strong>
              </p>
            )}
          </div>
          <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0">
            ✕
          </button>
        </div>

        {showAndroid && (
          <button
            onClick={handleAndroidInstall}
            className="mt-3 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
          >
            📲 Instalar agora
          </button>
        )}
      </div>
    </div>
  );
}
