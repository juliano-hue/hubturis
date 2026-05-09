'use client';
import dynamic from 'next/dynamic';
import ClientOnly from '@/components/ClientOnly';

const AvailabilityContent = dynamic(
  () => import('@/components/provider/AvailabilityContent'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center">Carregando...</div> }
);

export default function AvailabilityPage({ params }: { params: { id: string } }) {
  return (
    <ClientOnly>
      <AvailabilityContent attractionId={params.id} />
    </ClientOnly>
  );
}