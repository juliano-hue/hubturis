'use client';
export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function NewAttractionPlaceholder() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Nova Atração</h1>
        <p className="text-gray-600 mb-6">
          A página de criação de atrações está sendo atualizada.
          Em breve estará disponível novamente.
        </p>
        <Link href="/provider/my-attractions" className="text-blue-600 hover:underline">
          ← Voltar para minhas atrações
        </Link>
      </div>
    </div>
  );
}