'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'overview' | 'users' | 'providers' | 'attractions' | 'bookings' | 'plans';

const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-gray-100 text-gray-800',
  PAID: 'bg-green-100 text-green-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  FAILED: 'bg-red-100 text-red-800',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada',
  COMPLETED: 'Realizada', REJECTED: 'Rejeitada',
  PAID: 'Pago', REFUNDED: 'Reembolsado', FAILED: 'Falhou',
};

const PLAN_COLOR: Record<string, string> = {
  BRONZE: 'bg-amber-100 text-amber-800',
  SILVER: 'bg-slate-100 text-slate-700',
  GOLD: 'bg-yellow-100 text-yellow-800',
};

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [attractions, setAttractions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
      router.push('/admin/login');
    }
  }, [router]);

  const loadStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    setStats(data);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  const loadAttractions = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/attractions');
    const data = await res.json();
    setAttractions(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/bookings');
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
    if (tab === 'overview') loadStats();
    if (tab === 'users' || tab === 'providers') loadUsers();
    if (tab === 'attractions') loadAttractions();
    if (tab === 'bookings') loadBookings();
    if (tab === 'plans') loadUsers();
  }, [tab, loadStats, loadUsers, loadAttractions, loadBookings]);

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return;
    await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setUsers(u => u.filter(x => x.id !== id));
  };

  const changePlan = async (id: string, planType: string) => {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, planType }) });
    setUsers(u => u.map(x => x.id === id ? { ...x, planType } : x));
  };

  const logout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const providers = filteredUsers.filter(u => u.role === 'PROVIDER');
  const consumers = filteredUsers.filter(u => u.role === 'CONSUMER');
  const filteredAttractions = attractions.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.provider?.name || '').toLowerCase().includes(search.toLowerCase())
  );
  const filteredBookings = bookings.filter(b =>
    (b.attraction?.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.consumer?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Visão Geral', icon: '📊' },
    { key: 'users', label: 'Consumidores', icon: '👥' },
    { key: 'providers', label: 'Ofertantes', icon: '🏪' },
    { key: 'attractions', label: 'Atrações', icon: '🏖️' },
    { key: 'bookings', label: 'Reservas', icon: '📅' },
    { key: 'plans', label: 'Planos', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">🛡️ HubTuris Admin</span>
        </div>
        <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-sm font-medium transition">
          Sair
        </button>
      </div>

      {/* TABS */}
      <div className="bg-white border-b px-6 flex gap-1 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch(''); }}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* VISÃO GERAL */}
        {tab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total de Usuários', value: stats.totalUsers, icon: '👥', color: 'text-blue-600' },
                { label: 'Ofertantes', value: stats.totalProviders, icon: '🏪', color: 'text-purple-600' },
                { label: 'Consumidores', value: stats.totalConsumers, icon: '🛒', color: 'text-green-600' },
                { label: 'Atrações', value: stats.totalAttractions, icon: '🏖️', color: 'text-orange-600' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-2xl shadow p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs">{c.label}</p>
                      <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                    </div>
                    <span className="text-3xl">{c.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total de Reservas', value: stats.totalBookings, icon: '📋', color: 'text-blue-600' },
                { label: 'Reservas Confirmadas', value: stats.confirmedBookings, icon: '✅', color: 'text-green-600' },
                { label: 'Reservas Pendentes', value: stats.pendingBookings, icon: '⏳', color: 'text-yellow-600' },
                { label: 'Reservas este Mês', value: stats.bookingsThisMonth, icon: '📅', color: 'text-purple-600' },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-2xl shadow p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs">{c.label}</p>
                      <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
                    </div>
                    <span className="text-3xl">{c.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-semibold text-gray-700 mb-4">💰 Financeiro da Plataforma</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Volume total transacionado</span>
                    <span className="font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Comissão HubTuris (10%)</span>
                    <span className="font-bold text-blue-600">{formatCurrency(stats.platformCommission)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-semibold text-gray-700 mb-4">⭐ Distribuição de Planos</h3>
                <div className="space-y-3">
                  {[
                    { label: '🥉 Bronze', count: stats.plans.bronze, color: 'bg-amber-200' },
                    { label: '🥈 Prata', count: stats.plans.silver, color: 'bg-slate-300' },
                    { label: '🥇 Ouro', count: stats.plans.gold, color: 'bg-yellow-300' },
                  ].map(p => (
                    <div key={p.label} className="flex items-center gap-3">
                      <span className="text-sm w-20">{p.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${p.color}`}
                          style={{ width: stats.totalProviders > 0 ? `${(p.count / stats.totalProviders) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-sm font-bold w-6 text-right">{p.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONSUMIDORES */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">{consumers.length} consumidores</span>
            </div>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Nome', 'Email', 'Cidade', 'Reservas', 'Gasto Total', 'Cadastro', 'Ações'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
                  ) : consumers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{u.consumerProfile?.fullName || u.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">{u.consumerProfile?.city || '—'}</td>
                      <td className="px-4 py-3 text-center font-medium text-blue-600">{u.totalBookings}</td>
                      <td className="px-4 py-3 font-medium text-green-600">{formatCurrency(u.totalSpent)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteUser(u.id, u.name || u.email)} className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs hover:bg-red-200 transition">
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OFERTANTES */}
        {tab === 'providers' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">{providers.length} ofertantes</span>
            </div>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Nome', 'Email', 'Cidade/UF', 'Plano', 'Atrações', 'Cadastro', 'Ações'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
                  ) : providers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{u.providerProfile?.fullName || u.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">{u.providerProfile ? `${u.providerProfile.city}/${u.providerProfile.state}` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PLAN_COLOR[u.planType] || 'bg-gray-100'}`}>
                          {u.planType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-purple-600">{u.totalAttractions}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteUser(u.id, u.name || u.email)} className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs hover:bg-red-200 transition">
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ATRAÇÕES */}
        {tab === 'attractions' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por título ou ofertante..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">{filteredAttractions.length} atrações</span>
            </div>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Título', 'Ofertante', 'Plano', 'Cidade', 'Preço', 'Views', 'Reservas', 'Avaliação', 'Cadastro'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
                  ) : filteredAttractions.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium max-w-[200px] truncate">{a.title}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{a.provider?.name || a.provider?.email || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PLAN_COLOR[a.provider?.planType] || 'bg-gray-100'}`}>
                          {a.provider?.planType || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{a.city}/{a.state}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(a.price)}</td>
                      <td className="px-4 py-3 text-center text-blue-600">{a.viewCount ?? 0}</td>
                      <td className="px-4 py-3 text-center text-green-600">{a.totalBookings}</td>
                      <td className="px-4 py-3 text-center">
                        {a.totalReviews > 0 ? `⭐ ${a.averageRating.toFixed(1)} (${a.totalReviews})` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(a.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RESERVAS */}
        {tab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por atração ou consumidor..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">{filteredBookings.length} reservas</span>
            </div>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Atração', 'Consumidor', 'Ofertante', 'Data', 'Participantes', 'Valor', 'Status', 'Pagamento'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
                  ) : filteredBookings.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium max-w-[160px] truncate">{b.attraction?.title || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{b.consumer?.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{b.attraction?.provider?.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(b.date)}</td>
                      <td className="px-4 py-3 text-center">{b.participants}</td>
                      <td className="px-4 py-3 font-medium text-green-600">{formatCurrency(b.totalPrice)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[b.status] || 'bg-gray-100'}`}>
                          {STATUS_LABEL[b.status] || b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[b.paymentStatus] || 'bg-gray-100'}`}>
                          {STATUS_LABEL[b.paymentStatus] || b.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PLANOS */}
        {tab === 'plans' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar ofertante..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">{providers.length} ofertantes</span>
            </div>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Ofertante', 'Email', 'Plano Atual', 'Atrações', 'Alterar Plano'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
                  ) : providers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{u.providerProfile?.fullName || u.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PLAN_COLOR[u.planType] || 'bg-gray-100'}`}>
                          {u.planType === 'BRONZE' ? '🥉 Bronze' : u.planType === 'SILVER' ? '🥈 Prata' : '🥇 Ouro'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-purple-600 font-medium">{u.totalAttractions}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.planType}
                          onChange={e => changePlan(u.id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="BRONZE">🥉 Bronze</option>
                          <option value="SILVER">🥈 Prata</option>
                          <option value="GOLD">🥇 Ouro</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
