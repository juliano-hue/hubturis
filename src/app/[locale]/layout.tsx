// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ClientNavbarWrapper from '@/components/ClientNavbarWrapper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HubTuris',
  description: 'As melhores experiências turísticas de Natal e Região',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        {/* O ClientNavbarWrapper já contém o SessionProvider e o Navbar dinâmico */}
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ClientNavbarWrapper /> {/* <--- Use o ClientNavbarWrapper aqui */}
          <div className="pt-16">
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}