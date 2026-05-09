'use client';
import ClientOnly from '@/components/ClientOnly';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PLAN_CONFIG, PlanType } from '@/lib/plans';

// Imagens disponíveis na pasta atracoes-natal
const imagensDisponiveis = [
  '/atracoes-natal/Flow,_gere_para_202sss604211745.jpg',
  '/atracoes-natal/Flow,_gere_para_sss202fgdsssddszcs604211745.jpg',
  '/atracoes-natal/Flow,_gere_para_sss202fgdssss604211745.jpg',
  '/atracoes-natal/Flow,_gere_para_sss202sss604211745.jpg',
  '/atracoes-natal/Fotos_asdatraaasções_turismoasdaDF_202604211744.jpg',
  '/atracoes-natal/Fotos_asdatraaasções_turismo_202604211744.jpg',
  '/atracoes-natal/Fotos_asdatraaasções_turisSDFASmoasdaDF_202604211744.jpg',
  '/atracoes-natal/Fotos_asdatrações_turismo_202604211744.jpg',
  '/atracoes-natal/Fotos_atrações_turismo_202604211744 (1).jpeg',
  '/atracoes-natal/Fotos_atrações_turismo_202604211745.jpeg',
  '/atracoes-natal/Gere_imagens_turísticas_202604211742.jpeg',
  '/atracoes-natal/Gere_imagens_turísticas_202604211743 (1).jpeg',
  '/atracoes-natal/Gere_imagens_turísticas_202604211743.jpeg',
  '/atracoes-natal/Mitsubishi_Pajero_dune_202604211712.jpeg',
];

export default function ProviderDashboard() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [stats, setStats] = useState({
    totalAttractions: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0
  });
  const [planData, setPlanData] = useState<{ planType: string; totalViews: number; totalClicks: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [fundoIndex, setFundoIndex] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      setFundoIndex((prev) => (prev + 1) % imagensDisponiveis.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');

    if (!userId || role !== 'PROVIDER') {
      router.push('/login');
      return;
    }

    setUserName(name || 'Ofertante');

    const fetchStats = async () => {
      try {
        const attractionsRes = await fetch(`/api/provider/attractions?providerId=${userId}`);
        const attractionsData = await attractionsRes.json();
        const attractions = attractionsData.attractions || [];

        const bookingsRes = await fetch(`/api/bookings?providerId=${userId}`);
        const bookings = await bookingsRes.json();

        const totalBookings = bookings.length;
        const pendingBookings = bookings.filter((b: any) => b.status === 'PENDING').length;
        const totalRevenue = bookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0);

        setStats({
          totalAttractions: attractions.length,
          totalBookings,
          totalRevenue,
          pendingBookings
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    fetch(`/api/provider/plan?providerId=${userId}`)
      .then(res => res.json())
      .then(data => setPlanData(data))
      .catch(console.error);
  }, [isClient, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(price);
  };

  // UI única, toda envolvida por ClientOnly
  return (
    <ClientOnly>
      {!isClient || loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen">
          {/* HERO SECTION */}
          <div 
            className="relative h-[40vh] min-h-[300px] flex flex-col items-center justify-center text-white bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${imagensDisponiveis[fundoIndex]}')` }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
            
            <div className="relative z-10 text-center px-4">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-yellow-400">⭐</span>
                <span className="text-sm font-medium">Dashboard do Ofertante</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                Bem-vindo, {userName}!
              </h1>
              <p className="text-lg sm:text-xl text-gray-200">
                Gerencie suas atrações e acompanhe suas reservas
              </p>
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
              {imagensDisponiveis.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setFundoIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    fundoIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total de Atrações</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalAttractions}</p>
                  </div>
                  <div className="text-4xl">🏞️</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total de Reservas</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalBookings}</p>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Receita Total</p>
                    <p className="text-3xl font-bold text-purple-600">{formatPrice(stats.totalRevenue)}</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Reservas Pendentes</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.pendingBookings}</p>
                  </div>
                  <div className="text-4xl">⏳</div>
                </div>
              </div>
            </div>

            {/* CARD DE PLANO */}
            {planData && (() => {
              const plan = (planData.planType || 'BRONZE') as PlanType;
              const pc = PLAN_CONFIG[plan];
              const isUpgradeable = plan === 'BRONZE';
              return (
                <div className={`rounded-2xl border-2 ${pc.borderColor} ${pc.bgColor} p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{pc.emoji}</span>
                    <div>
                      <p className="text-xs text-gray-500">Plano atual</p>
                      <p className={`text-lg font-bold ${pc.color}`}>{pc.name}</p>
                      <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                        <span>👁️ {planData.totalViews} views</span>
                        <span>🖱️ {planData.totalClicks} cliques</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/provider/plan" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50 transition">
                      Ver detalhes
                    </Link>
                    {isUpgradeable && (
                      <Link href="/provider/plan" className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-sm font-semibold hover:from-yellow-600 hover:to-orange-600 transition">
                        🚀 Fazer upgrade
                      </Link>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* NAVEGAÇÃO RÁPIDA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <Link
                href="/provider/attractions/new"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-6 text-center transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-3">➕</div>
                <h3 className="text-lg font-semibold">Nova Atração</h3>
                <p className="text-sm text-blue-100 mt-1">Cadastre uma nova experiência</p>
              </Link>

              <Link
                href="/provider/my-attractions"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-6 text-center transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-lg font-semibold">Minhas Atrações</h3>
                <p className="text-sm text-purple-100 mt-1">Gerencie seu catálogo</p>
              </Link>

              <Link
                href="/provider/bookings"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl p-6 text-center transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-3">📅</div>
                <h3 className="text-lg font-semibold">Reservas</h3>
                <p className="text-sm text-green-100 mt-1">Visualize suas reservas</p>
              </Link>

              <Link
                href="/provider/profile"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl p-6 text-center transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-3">👤</div>
                <h3 className="text-lg font-semibold">Meu Perfil</h3>
                <p className="text-sm text-orange-100 mt-1">Altere suas informações</p>
              </Link>
            </div>

            {/* LINK MEU PLANO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Link
                href="/provider/plan"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl p-5 flex items-center gap-4 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="text-4xl">⭐</div>
                <div>
                  <h3 className="text-lg font-semibold">Meu Plano & Visibilidade</h3>
                  <p className="text-sm text-yellow-100">Gerencie plano e Turbo Boost</p>
                </div>
              </Link>
              <Link
                href="/provider/attractions/new"
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-2xl p-5 flex items-center gap-4 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="text-4xl">⚡</div>
                <div>
                  <h3 className="text-lg font-semibold">Turbo Boost</h3>
                  <p className="text-sm text-teal-100">Destaque sua atração agora</p>
                </div>
              </Link>
            </div>

            {/* LINK ÚTIL - VOLTAR PARA O INÍCIO */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
              >
                ← Voltar para o início
              </Link>
            </div>
          </div>
        </div>
      )}
    </ClientOnly>
  );
}