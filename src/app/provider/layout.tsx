'use client';
import { NextIntlClientProvider } from 'next-intl';
import { useLocale } from 'next-intl';
import Navbar from '@/components/Navbar';

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  return (
    <NextIntlClientProvider locale={locale}>
      <Navbar />
      <main className="pt-20">{children}</main>
    </NextIntlClientProvider>
  );
}