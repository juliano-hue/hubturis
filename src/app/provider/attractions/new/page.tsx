'use client';
import dynamic from 'next/dynamic';
import ClientOnly from '@/components/ClientOnly';

const AttractionFormContent = dynamic(
  () => import('@/components/provider/AttractionFormContent'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center">Carregando...</div> }
);

export default function NewAttractionPage() {
  return (
    <ClientOnly>
      <AttractionFormContent />
    </ClientOnly>
  );
}
