'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProviderAttractionsPage() {
  const [isClient, setIsClient] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'PROVIDER') {
      alert('Acesso permitido apenas para Ofertantes.');
      router.push('/users');
    }
  }, [isClient, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const providerId = localStorage.getItem('userId') || "";
      const response = await fetch('/api/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          providerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar atração');
      }

      setSuccessMessage('Atração cadastrada com sucesso!');
      setTitle('');
      setDescription('');
      setPrice('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: 20 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 30 }}>Cadastro de Atração / Serviço</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <input
          type="text"
          placeholder="Título da Atração"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 14, borderRadius: 8, border: '1px solid #ccc' }}
          required
        />

        <textarea
          placeholder="Descrição completa (até 2000 caracteres)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={8}
          style={{ padding: 14, borderRadius: 8, border: '1px solid #ccc', resize: 'vertical' }}
          required
        />

        <input
          type="number"
          placeholder="Valor (R$)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          step="0.01"
          style={{ padding: 14, borderRadius: 8, border: '1px solid #ccc' }}
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 16,
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Atração'}
        </button>
      </form>

      {successMessage && <p style={{ color: 'green', marginTop: 20, textAlign: 'center' }}>{successMessage}</p>}
      {error && <p style={{ color: 'red', marginTop: 20, textAlign: 'center' }}>{error}</p>}
    </main>
  );
}