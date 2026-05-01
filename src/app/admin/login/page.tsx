'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Credenciais do administrador
    if (email.trim() === 'admin@hubturis.com' && password === 'admin123') {
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminEmail', email.trim());

      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 100);
    } else {
      setError('Email ou senha incorretos. Use: admin@hubturis.com / admin123');
    }

    setLoading(false);
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '40px 30px',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '420px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ color: '#1e40af', margin: 0 }}>Painel Administrativo</h1>
          <p style={{ color: '#64748b', marginTop: 8 }}>HubTuris - Gerenciamento</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#334155', fontWeight: 500 }}>
              Email do Administrador
            </label>
            <input
              type="email"
              placeholder="admin@hubturis.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#334155', fontWeight: 500 }}>
              Senha
            </label>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px' }}
              required
            />
          </div>

          {error && <p style={{ color: '#ef4444', textAlign: 'center', margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              backgroundColor: '#1e40af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 10
            }}
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 25, color: '#64748b', fontSize: '14px' }}>
          Credenciais padrão:<br />
          <strong>admin@hubturis.com</strong> / <strong>admin123</strong>
        </p>
      </div>
    </main>
  );
}