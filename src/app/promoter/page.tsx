'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';

const COMMISSION = { CONSUMER: 1.5, PROVIDER: 5 };

export default function PromoterPage() {
  const [code, setCode] = useState('');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    if (!code.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(`/api/referral?code=${code.trim().toUpperCase()}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Código não encontrado'); }
      else setData(json);
    } catch { setError('Erro ao buscar dados.'); }
    finally { setLoading(false); }
  };

  const earned = data
    ? (data.totalConsumers * COMMISSION.CONSUMER) + (data.totalProviders * COMMISSION.PROVIDER)
    : 0;

  const qrUrl = data
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://hubturis.com.br/pt/register?ref=${data.code}`)}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📲</div>
          <h1 className="text-3xl font-bold text-gray-900">Painel do Promotor</h1>
          <p className="text-gray-500 mt-2">Digite seu código para ver seus resultados</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && lookup()}
              placeholder="Seu código (ex: JOAO001)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono uppercase"
            />
            <button
              onClick={lookup}
              disabled={loading}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition disabled:opacity-50"
            >
              {loading ? '...' : 'Buscar'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        {data && (
          <div className="space-y-4">
            {/* IDENTIDADE */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="font-bold text-gray-800 text-lg mb-1">{data.name}</h2>
              <p className="text-gray-500 text-sm">{data.email}</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                <span className="text-xs text-blue-600 font-mono font-bold">{data.code}</span>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total cadastros', value: data.totalReferrals, icon: '👥', color: 'text-blue-600' },
                { label: 'Turistas', value: data.totalConsumers, icon: '🛒', color: 'text-green-600' },
                { label: 'Ofertantes', value: data.totalProviders, icon: '🏪', color: 'text-purple-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl shadow p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* SALDO */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <p className="text-green-100 text-sm mb-1">Saldo a receber</p>
              <p className="text-4xl font-bold">
                {earned.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <div className="mt-3 text-xs text-green-100 space-y-1">
                <p>{data.totalConsumers} turista(s) × R$ {COMMISSION.CONSUMER.toFixed(2)} = R$ {(data.totalConsumers * COMMISSION.CONSUMER).toFixed(2)}</p>
                <p>{data.totalProviders} ofertante(s) × R$ {COMMISSION.PROVIDER.toFixed(2)} = R$ {(data.totalProviders * COMMISSION.PROVIDER).toFixed(2)}</p>
              </div>
            </div>

            {/* QR CODE */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="font-semibold text-gray-800 mb-4">Seu QR Code de indicação</p>
              {qrUrl && <img src={qrUrl} alt="QR Code" className="mx-auto rounded-xl" />}
              <p className="text-xs text-gray-400 mt-3 break-all">
                hubturis.com.br/pt/register?ref={data.code}
              </p>
              <a
                href={qrUrl || '#'}
                download={`qrcode-${data.code}.png`}
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition"
              >
                ⬇️ Baixar QR Code
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
