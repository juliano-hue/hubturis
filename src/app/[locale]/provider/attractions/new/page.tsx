'use client';
export const dynamic = 'force-dynamic';

import dynamicImport from 'next/dynamic';
import ClientOnly from '@/components/ClientOnly';

const AttractionFormContent = dynamicImport(
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
