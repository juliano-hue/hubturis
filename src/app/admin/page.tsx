'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'CONSUMER' | 'PROVIDER' | 'ADMIN';
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Erro ao carregar usuários');
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string, name?: string | null) => {
    if (!confirm(`Tem certeza que deseja excluir "${name || id}"?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setUsers(users.filter(user => user.id !== id));
        alert('Usuário excluído com sucesso.');
      } else {
        alert('Não foi possível excluir o usuário.');
      }
    } catch (err) {
      alert('Erro ao excluir usuário.');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };

  return (
    <main style={{ maxWidth: 1200, margin: '40px auto', padding: 20, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 style={{ color: '#1e40af' }}>Painel do Administrador - TurisHub</h1>
        <button
          onClick={logout}
          style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          Sair
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', padding: 25, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: 20 }}>Usuários Cadastrados ({users.length})</h2>

        {loading && <p>Carregando usuários...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              <th style={{ padding: 15, textAlign: 'left' }}>Nome</th>
              <th style={{ padding: 15, textAlign: 'left' }}>Email</th>
              <th style={{ padding: 15, textAlign: 'center' }}>Função</th>
              <th style={{ padding: 15, textAlign: 'center' }}>Data de Cadastro</th>
              <th style={{ padding: 15, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: 15 }}>{user.name || '—'}</td>
                <td style={{ padding: 15 }}>{user.email}</td>
                <td style={{ padding: 15, textAlign: 'center' }}>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: 9999,
                    fontSize: '0.9em',
                    color: 'white',
                    backgroundColor: user.role === 'ADMIN' ? '#b91c1c' : 
                                     user.role === 'PROVIDER' ? '#c2410c' : '#15803d'
                  }}>
                    {user.role === 'CONSUMER' ? 'Consumidor' :
                     user.role === 'PROVIDER' ? 'Ofertante' : 'Administrador'}
                  </span>
                </td>
                <td style={{ padding: 15, textAlign: 'center' }}>
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: 15, textAlign: 'center' }}>
                  {user.role !== 'ADMIN' && (
                    <button
                      onClick={() => deleteUser(user.id, user.name)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: '0.9em'
                      }}
                    >
                      Excluir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}