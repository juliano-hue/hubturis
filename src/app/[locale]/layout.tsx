// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ClientNavbarWrapper from '@/components/ClientNavbarWrapper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'HubTuris', template: '%s | HubTuris' },
  description: 'Descubra e contrate as melhores experiências turísticas de Natal e Região. Passeios de buggy, mergulho, city tour e muito mais.',
  keywords: ['turismo natal', 'passeios natal rn', 'experiências turísticas', 'buggy dunas natal', 'hubturis'],
  authors: [{ name: 'HubTuris' }],
  creator: 'HubTuris',
  metadataBase: new URL('https://hubturis.com.br'),
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://hubturis.com.br',
    siteName: 'HubTuris',
    title: 'HubTuris — Experiências turísticas em Natal e Região',
    description: 'Descubra e contrate as melhores experiências turísticas de Natal e Região.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'HubTuris' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HubTuris — Experiências turísticas em Natal e Região',
    description: 'Descubra e contrate as melhores experiências turísticas de Natal e Região.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
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