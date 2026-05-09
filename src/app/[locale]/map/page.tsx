'use client';

import { useState, useEffect } from 'react';
import dynamicImport from 'next/dynamic';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const AttractionMap = dynamicImport(() => import('@/components/AttractionMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Carregando mapa...</p>
      </div>
    </div>
  ),
});

const CATEGORY_COLORS: Record<string, string> = {
  'Aventura': 'bg-orange-100 text-orange-700',
  'Cultural': 'bg-purple-100 text-purple-700',
  'Ecoturismo': 'bg-green-100 text-green-700',
  'Praia': 'bg-blue-100 text-blue-700',
  'Gastronomia': 'bg-red-100 text-red-700',
  'City Tour': 'bg-indigo-100 text-indigo-700',
  'Hospedagem': 'bg-pink-100 text-pink-700',
};

export default function MapPage() {
  const locale = useLocale();
  const [attractions, setAttractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/attractions')
      .then(res => res.json())
      .then(data => { setAttractions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(attractions.map(a => a.category).filter(Boolean)))];

  const filtered = attractions.filter(a => {
    const matchCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href={`/${locale}/attractions`} className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium mb-4 transition">
            ← Ver lista de atrações
          </Link>
          <h1 className="text-3xl font-bold mb-1">🗺️ Mapa de Atrações</h1>
          <p className="text-blue-100">Explore experiências turísticas em Natal e Região</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

        {/* FILTROS */}
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar atração ou cidade..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : `${CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-600'} hover:opacity-80`
                }`}
              >
                {cat === 'all' ? '🌎 Todas' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* CONTADOR */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-blue-600">{filtered.length}</span> atração(ões) no mapa
          </p>
          <Link
            href={`/${locale}/attractions`}
            className="text-sm text-blue-600 hover:underline"
          >
            Ver em lista →
          </Link>
        </div>

        {/* MAPA */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <div className="h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Carregando atrações...</p>
              </div>
            </div>
          ) : (
            <AttractionMap attractions={filtered} locale={locale} />
          )}
        </div>

        {/* LEGENDA */}
        <div className="bg-white rounded-2xl shadow p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3">LEGENDA</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries({
              'Aventura': '🏄', 'Cultural': '🏛️', 'Ecoturismo': '🌿',
              'Praia': '🏖️', 'Gastronomia': '🍽️', 'City Tour': '🏙️', 'Hospedagem': '🏨'
            }).map(([cat, icon]) => (
              <div key={cat} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-600'}`}>
                <span>{icon}</span>
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
