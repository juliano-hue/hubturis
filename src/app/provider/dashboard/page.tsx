'use client';
import dynamic from 'next/dynamic';
import ClientOnly from '@/components/ClientOnly';

const DashboardContent = dynamic(
  () => import('@/components/provider/DashboardContent'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center">Carregando...</div> }
);

export default function ProviderDashboard() {
  return (
    <ClientOnly>
      <DashboardContent />
    </ClientOnly>
  );
}