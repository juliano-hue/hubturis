'use client';
import dynamic from 'next/dynamic';
import ClientOnly from '@/components/ClientOnly';

const EditAttractionContent = dynamic(
  () => import('@/components/provider/EditAttractionContent'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center">Carregando...</div> }
);

export default function EditAttractionPage() {
  return (
    <ClientOnly>
      <EditAttractionContent />
    </ClientOnly>
  );
}