'use client';
import dynamic from 'next/dynamic';
import ClientOnly from '@/components/ClientOnly';

const MyAttractionsContent = dynamic(
  () => import('@/components/provider/MyAttractionsContent'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center">Carregando...</div> }
);

export default function ProviderMyAttractionsPage() {
  return (
    <ClientOnly>
      <MyAttractionsContent />
    </ClientOnly>
  );
}