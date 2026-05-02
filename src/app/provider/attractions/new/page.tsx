'use client';
import dynamic from 'next/dynamic';

// Importa o componente real sem SSR (pré-renderização desabilitada)
const NewAttractionForm = dynamic(
  () => import('@/components/NewAttractionForm'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center">Carregando...</div> }
);

export default function NewAttractionPage() {
  return <NewAttractionForm />;
}