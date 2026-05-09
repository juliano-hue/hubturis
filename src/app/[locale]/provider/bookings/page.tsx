'use client';
import dynamic from 'next/dynamic';
import ClientOnly from '@/components/ClientOnly';

const BookingsContent = dynamic(
  () => import('@/components/provider/BookingsContent'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center">Carregando...</div> }
);

export default function ProviderBookingsPage() {
  return (
    <ClientOnly>
      <BookingsContent />
    </ClientOnly>
  );
}