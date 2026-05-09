'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PLAN_CONFIG, BOOST_OPTIONS, PlanType } from '@/lib/plans';

interface PlanData {
  planType: string;
  planExpiresAt: string | null;
  totalViews: number;
  totalClicks: number;
  attractionsCount: number;
  attractions: {
    id: string;
    title: string;
    viewCount: number;
    clickCount: number;
    featuredUntil: string | null;
    averageRating: number;
    reviewCount: number;
  }[];
}

export default function ProviderPlanPage() {
  const router = useRouter();
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [boostingId, setBoostingId] = useState<string | null>(null);
  const [boostSuccess, setBoostSuccess] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    if (!userId || role !== 'PROVIDER') { router.push('/login'); return; }

    fetch(`/api/provider/plan?providerId=${userId}`)
      .then(res => res.json())
      .then(data => { setPlanData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const handleBoost = async (attractionId: string, days: number, price: number) => {
    if (!confirm(`Ativar Turbo Boost de ${days} dias por R$ ${price.toFixed(2)} para esta atração?\n\n(O pagamento será implementado em breve. Por ora, o boost será ativado gratuitamente como demonstração.)`)) return;

    setBoostingId(attractionId);
    const userId = localStorage.getItem('userId');

    try {
      const res = await fetch('/api/provider/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: userId, action: 'boost', attractionId, days }),
      });
      const data = await res.json();
      if (data.success) {
        setBoostSuccess(attractionId);
        const updatedRes = await fetch(`/api/provider/plan?providerId=${userId}`);
        const updated = await updatedRes.json();
        setPlanData(updated);
        setTimeout(() => setBoostSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBoostingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentPlan = (planData?.planType || 'BRONZE') as PlanType;
  const config = PLAN_CONFIG[currentPlan];
  const plans: PlanType[] = ['BRONZE', 'SILVER', 'GOLD'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/provider/dashboard" className="text-white/70 hover:text-white text-sm">← Dashboard</Link>
          </div>
          <h1 className="text-3xl font-bold mb-1">Meu Plano & Visibilidade</h1>
          <p className="text-blue-100">Gerencie seu plano e aumente a visibilidade das suas atrações</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* PLANO ATUAL */}
        <div className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Seu plano atual</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{config.emoji}</span>
                <span className={`text-2xl font-bold ${config.color}`}>Plano {config.name}</span>
                {currentPlan === 'BRONZE' && (
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">Gratuito</span>
                )}
              </div>
              {planData?.planExpiresAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Válido até {new Date(planData.planExpiresAt).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            {/* MÉTRICAS RÁPIDAS */}
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{planData?.totalViews ?? 0}</p>
                <p className="text-xs text-gray-500">Visualizações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{planData?.totalClicks ?? 0}</p>
                <p className="text-xs text-gray-500">Cliques</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{planData?.attractionsCount ?? 0}</p>
                <p className="text-xs text-gray-500">Atrações</p>
              </div>
            </div>
          </div>
        </div>

        {/* COMPARATIVO DE PLANOS */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Compare os planos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => {
              const pc = PLAN_CONFIG[plan];
              const isCurrent = plan === currentPlan;
              return (
                <div key={plan} className={`rounded-2xl border-2 p-6 relative ${isCurrent ? `${pc.borderColor} ${pc.bgColor}` : 'border-gray-200 bg-white'}`}>
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                      Plano atual
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{pc.emoji}</div>
                    <h3 className={`text-xl font-bold ${pc.color}`}>{pc.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {pc.price === 0 ? 'Gratuito' : `R$ ${pc.price}/mês`}
                    </p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {pc.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && plan !== 'BRONZE' && (
                    <button
                      className={`w-full py-2 rounded-xl font-semibold text-white transition ${plan === 'GOLD' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-slate-500 hover:bg-slate-600'}`}
                      onClick={() => alert('Sistema de pagamento em breve! Em fase de implementação.')}
                    >
                      Assinar {pc.name}
                    </button>
                  )}
                  {isCurrent && (
                    <div className={`w-full py-2 rounded-xl font-semibold text-center ${pc.color} ${pc.bgColor} border ${pc.borderColor}`}>
                      ✓ Plano ativo
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TURBO BOOST */}
        {planData && planData.attractions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">⚡ Turbo Boost</h2>
            <p className="text-gray-500 text-sm mb-4">
              Coloque sua atração em destaque temporariamente, independente do seu plano.
            </p>

            <div className="space-y-4">
              {planData.attractions.map(attr => {
                const isBoosted = attr.featuredUntil && new Date(attr.featuredUntil) > new Date();
                const boostedUntil = attr.featuredUntil ? new Date(attr.featuredUntil) : null;

                return (
                  <div key={attr.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800">{attr.title}</p>
                          {isBoosted && (
                            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                              ⚡ Em destaque
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          <span>👁️ {attr.viewCount} views</span>
                          <span>🖱️ {attr.clickCount} cliques</span>
                          <span>⭐ {attr.averageRating.toFixed(1)} ({attr.reviewCount} avaliações)</span>
                        </div>
                        {isBoosted && boostedUntil && (
                          <p className="text-xs text-orange-600 mt-1">
                            Destaque ativo até {boostedUntil.toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        {boostSuccess === attr.id && (
                          <p className="text-xs text-green-600 mt-1">✅ Boost ativado com sucesso!</p>
                        )}
                      </div>

                      {!isBoosted && (
                        <div className="flex gap-2 flex-wrap">
                          {BOOST_OPTIONS.map(opt => (
                            <button
                              key={opt.days}
                              onClick={() => handleBoost(attr.id, opt.days, opt.price)}
                              disabled={boostingId === attr.id}
                              className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-medium rounded-full transition disabled:opacity-50"
                            >
                              {boostingId === attr.id ? '...' : `⚡ ${opt.label} — R$ ${opt.price.toFixed(2)}`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FOOTER NAV */}
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/provider/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">← Dashboard</Link>
          <Link href="/provider/my-attractions" className="text-gray-500 hover:text-gray-700 text-sm">Minhas Atrações →</Link>
        </div>
      </div>
    </div>
  );
}
