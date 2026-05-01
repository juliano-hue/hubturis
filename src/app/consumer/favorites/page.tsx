'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StarDisplay from '@/components/StarDisplay';

interface Favorite {
  id: string;
  attractionId: string;
  attraction: {
    id: string;
    title: string;
    description: string;
    city: string;
    state: string;
    price: number;
    pricingType: string;
    images: string[];
    averageRating: number;
    totalReviews: number;
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }

    fetch('/api/favorites', {
      headers: { 'x-user-id': userId }
    })
      .then(res => res.json())
      .then(data => {
        setFavorites(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const removeFavorite = async (attractionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = localStorage.getItem('userId');
    await fetch(`/api/favorites?attractionId=${attractionId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': userId || '' },
    });
    setFavorites(favorites.filter(f => f.attractionId !== attractionId));
  };

  const formatPrice = (price: number, pricingType: string) => {
    if (pricingType === 'FLAT_RATE') {
      return `R$ ${price} (grupo)`;
    }
    return `R$ ${price}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl sm:text-2xl">Carregando favoritos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">❤️ Meus Favoritos</h1>
          <Link href="/consumer" className="text-blue-600 hover:text-blue-800 text-sm sm:text-base">
            ← Voltar ao Dashboard
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">❤️</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Nenhum favorito ainda</h2>
            <p className="text-gray-500 text-sm sm:text-base mb-5 sm:mb-6">Explore atrações e marque suas preferidas!</p>
            <Link
              href="/attractions"
              className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-sm sm:text-base min-h-[44px]"
            >
              Explorar atrações
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer"
                onClick={() => router.push(`/attractions/${fav.attractionId}`)}
              >
                <div className="relative h-44 sm:h-48 overflow-hidden">
                  <img
                    src={fav.attraction.images?.[0] || '/Frank/IMG_3433.JPG'}
                    alt={fav.attraction.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => removeFavorite(fav.attractionId, e)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-lg sm:text-xl hover:scale-110 transition min-w-[32px]"
                  >
                    ❤️
                  </button>
                </div>
                <div className="p-3 sm:p-5">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-1 mb-1">
                    {fav.attraction.title}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm mb-2">
                    📍 {fav.attraction.city}, {fav.attraction.state}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <StarDisplay rating={fav.attraction.averageRating} size="sm" />
                    {fav.attraction.totalReviews > 0 && (
                      <span className="text-xs text-gray-500">({fav.attraction.totalReviews})</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">
                      {formatPrice(fav.attraction.price, fav.attraction.pricingType)}
                    </span>
                    <span className="text-blue-600 text-xs sm:text-sm">Ver detalhes →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}