'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SiteLogoutButton() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const handleLogout = async () => {
    await fetch('/api/site-logout', { method: 'POST' });
    router.push('/site-login');
  };

  useEffect(() => {
    let inactivityTimeout: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;
    const INACTIVITY_LIMIT = 2 * 60 * 1000; // 2 minutos

    const resetInactivityTimer = () => {
      // Limpar timers existentes
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      if (countdownInterval) clearInterval(countdownInterval);
      setTimeLeft(null);

      // Iniciar novo timer de inatividade
      inactivityTimeout = setTimeout(() => {
        // Iniciar contagem regressiva de 10 segundos
        let countdown = 10;
        setTimeLeft(countdown);
        
        countdownInterval = setInterval(() => {
          countdown--;
          setTimeLeft(countdown);
          
          if (countdown <= 0) {
            clearInterval(countdownInterval);
            handleLogout();
          }
        }, 1000);
      }, INACTIVITY_LIMIT);
    };

    // Eventos que indicam atividade (clique, movimento, teclado, scroll)
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove'];
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      if (countdownInterval) clearInterval(countdownInterval);
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, []);

  return (
    <>
      {timeLeft !== null && timeLeft > 0 && (
        <div className="fixed top-20 right-4 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-pulse">
          ⏰ Sessão expira em {timeLeft} segundo{timeLeft !== 1 ? 's' : ''}...
        </div>
      )}
    </>
  );
}