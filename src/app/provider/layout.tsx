'use client';
export const dynamic = 'force-dynamic';

import ClientNavbarWrapper from '@/components/ClientNavbarWrapper';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientNavbarWrapper />
      <main className="pt-20">{children}</main>
    </>
  );
}