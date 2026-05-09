'use client';
import dynamic from 'next/dynamic';
import ClientOnly from '@/components/ClientOnly';
import { useParams } from 'next/navigation';

const AttractionFormContent = dynamic(
  () => import('@/components/provider/AttractionFormContent'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center">Carregando...</div> }
);

export default function EditAttractionPage() {
  const params = useParams();
  const attractionId = params.id as string;
  return (
    <ClientOnly>
      <AttractionFormContent attractionId={attractionId} />
    </ClientOnly>
  );
}
