'use client';
import { useState } from 'react';

type UserRole = 'CONSUMER' | 'PROVIDER';

export default function UsersPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('CONSUMER');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar usuário.');
      }

      setSuccessMessage(`Usuário "${data.name || data.email}" cadastrado com sucesso como ${data.role === 'CONSUMER' ? 'Consumidor' : 'Ofertante'}!`);
      
      // Limpa o formulário
      setEmail('');
      setName('');
      setRole('CONSUMER');
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: 800,
        margin: '40px auto',
        padding: 20,
        fontFamily: 'sans-serif',
        backgroundColor: '#f9f9f9',
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      }}
    >
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: 30 }}>
        Cadastro de Usuários
      </h1>

      <section
        style={{
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 30,
          backgroundColor: '#fff',
        }}
      >
        <h2 style={{ marginBottom: 25, color: '#555' }}>Adicionar Novo Usuário</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 14, border: '1px solid #ccc', borderRadius: 8, fontSize: '16px' }}
            required
          />

          <input
            type="text"
            placeholder="Nome (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: 14, border: '1px solid #ccc', borderRadius: 8, fontSize: '16px' }}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            style={{ padding: 14, border: '1px solid #ccc', borderRadius: 8, fontSize: '16px' }}
          >
            <option value="CONSUMER">Consumidor</option>
            <option value="PROVIDER">Ofertante</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              border: 'none',
              borderRadius: 8,
              backgroundColor: '#2563eb',
              color: '#fff',
              fontWeight: 700,
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
          </button>
        </form>

        {error && <p style={{ color: 'red', marginTop: 15, textAlign: 'center' }}>{error}</p>}
        {successMessage && <p style={{ color: 'green', marginTop: 15, textAlign: 'center' }}>{successMessage}</p>}
      </section>
    </main>
  );
}