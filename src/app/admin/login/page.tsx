'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();

  useEffect(() => {
    // Admin agora usa o login padrão da plataforma
    router.replace('/pt/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900">
      <p className="text-white">Redirecionando...</p>
    </div>
  );
}
