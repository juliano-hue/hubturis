'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminLogoPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const response = await fetch('/api/admin/upload-logo');
      const data = await response.json();
      if (data.hasLogo) {
        setLogoUrl(data.url);
      }
    } catch (error) {
      console.error('Erro ao buscar logo:', error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('gif')) {
      setMessage('❌ Apenas arquivos GIF são permitidos');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage('❌ Arquivo muito grande. Máximo 2MB');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Logo atualizada com sucesso!');
        setLogoUrl(data.url + '?t=' + Date.now());
        window.dispatchEvent(new Event('logo-updated'));
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erro ao fazer upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="mb-4">
          <Link href="/admin" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Voltar para Admin
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Logo do HubTuris</h1>
          <p className="text-gray-500 text-sm mb-6">Gerencie a logo animada do site</p>
          
          {logoUrl && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
              <img 
                src={logoUrl} 
                alt="Logo atual" 
                className="max-w-full h-auto max-h-24 mx-auto"
              />
              <p className="text-xs text-gray-500 mt-2">Logo atual (GIF animado)</p>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
            <label className="cursor-pointer block">
              <div className="text-4xl mb-2">📁</div>
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                {loading ? 'Enviando...' : 'Clique para selecionar GIF'}
              </span>
              <input
                type="file"
                accept="image/gif"
                onChange={handleUpload}
                disabled={loading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-3">
              Apenas arquivos GIF animados<br />
              Tamanho recomendado: 120x40px até 200x60px<br />
              Máximo 2MB
            </p>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">📌 Dicas:</h3>
            <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
              <li>Use GIFs com fundo transparente</li>
              <li>Mantenha a animação suave (não muito rápida)</li>
              <li>Teste em celular e desktop</li>
              <li>Se não funcionar, volte ao texto padrão automaticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}