'use client';

import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <html lang="pt">
      <head>
        <meta name="application-name" content="HubTuris" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HubTuris" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/favicon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body>
        <SessionProvider>
          {children}
          <PWAInstallPrompt />
        </SessionProvider>
      </body>
    </html>
  );
}
