'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Booking {
  id: string;
  date: string;
  createdAt: string;
  participants: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  attraction: { title: string; city: string; };
  consumer: { name: string | null; email: string; };
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada',
  COMPLETED: 'Realizada', PAID: 'Pago', REFUNDED: 'Reembolsado',
};

export default function ProviderFinancialPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    if (!userId || role !== 'PROVIDER') { router.push('/login'); return; }

    fetch(`/api/bookings?providerId=${userId}`, { headers: { 'x-user-id': userId } })
      .then(res => res.json())
      .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const filtered = bookings.filter(b => {
    if (filter === 'paid') return b.paymentStatus === 'PAID';
    if (filter === 'pending') return b.paymentStatus === 'PENDING';
    return true;
  });

  const totalBruto = bookings.filter(b => b.paymentStatus === 'PAID').reduce((s, b) => s + b.totalPrice, 0);
  const comissao = totalBruto * 0.1;
  const totalLiquido = totalBruto - comissao;
  const pendente = bookings.filter(b => b.paymentStatus === 'PENDING').reduce((s, b) => s + b.totalPrice, 0);

  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
  const receitaMes = bookings
    .filter(b => b.paymentStatus === 'PAID' && new Date(b.createdAt) >= thisMonth)
    .reduce((s, b) => s + b.totalPrice, 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/provider/dashboard" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-full transition text-sm mb-4 backdrop-blur-sm">
            ← Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-1">💰 Extrato Financeiro</h1>
          <p className="text-green-100">Acompanhe suas receitas e repasses</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Receita Total (bruta)', value: fmt(totalBruto), icon: '💰', color: 'text-green-600' },
            { label: 'Comissão HubTuris (10%)', value: fmt(comissao), icon: '🏛️', color: 'text-red-500' },
            { label: 'Valor Líquido a Receber', value: fmt(totalLiquido), icon: '✅', color: 'text-blue-600' },
            { label: 'Receita este Mês', value: fmt(receitaMes), icon: '📅', color: 'text-purple-600' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl shadow p-5">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-gray-500 text-xs mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        {/* AVISO PRAZO */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="font-semibold text-blue-800">Prazo de repasse</p>
            <p className="text-blue-700 text-sm mt-1">
              Os valores são repassados em até <strong>D+1</strong> após a confirmação do pagamento.
              O sistema de pagamento será ativado em breve. Os valores abaixo são de reservas registradas na plataforma.
            </p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-bold text-gray-800 text-lg">Histórico de Reservas</h2>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Todas' },
                { key: 'paid', label: 'Pagas' },
                { key: 'pending', label: 'Pendentes' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as any)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${filter === f.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <div className="text-5xl mb-3">📋</div>
              <p>Nenhuma reserva encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Atração', 'Consumidor', 'Data Exp.', 'Participantes', 'Valor Bruto', 'Comissão', 'Valor Líquido', 'Status', 'Pagamento'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-gray-600 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium max-w-[160px] truncate">{b.attraction?.title}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{b.consumer?.name || b.consumer?.email}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(b.date)}</td>
                      <td className="px-4 py-3 text-center">{b.participants}</td>
                      <td className="px-4 py-3 font-medium text-green-600 whitespace-nowrap">{fmt(b.totalPrice)}</td>
                      <td className="px-4 py-3 text-red-500 whitespace-nowrap">-{fmt(b.totalPrice * 0.1)}</td>
                      <td className="px-4 py-3 font-bold text-blue-600 whitespace-nowrap">{fmt(b.totalPrice * 0.9)}</td>
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
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 font-bold text-gray-700">Total ({filtered.length} reservas)</td>
                    <td className="px-4 py-3 font-bold text-green-600">{fmt(filtered.reduce((s,b)=>s+b.totalPrice,0))}</td>
                    <td className="px-4 py-3 font-bold text-red-500">-{fmt(filtered.reduce((s,b)=>s+b.totalPrice,0)*0.1)}</td>
                    <td className="px-4 py-3 font-bold text-blue-600">{fmt(filtered.reduce((s,b)=>s+b.totalPrice,0)*0.9)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
