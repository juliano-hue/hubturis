'use client';
import dynamic from 'next/dynamic';
import ClientOnly from '@/components/ClientOnly';

const PaymentContent = dynamic(
  () => import('@/components/consumer/PaymentContent'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center">Carregando...</div> }
);

export default function PaymentPage({ params }: { params: { id: string } }) {
  return (
    <ClientOnly>
      <PaymentContent bookingId={params.id} />
    </ClientOnly>
  );
}