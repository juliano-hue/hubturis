'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Attraction {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  category: string | null;
  images: string[];
  averageRating: number;
  location: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Aventura': '#f97316',
  'Cultural': '#a855f7',
  'Ecoturismo': '#22c55e',
  'Praia': '#3b82f6',
  'Gastronomia': '#ef4444',
  'City Tour': '#6366f1',
  'Hospedagem': '#ec4899',
  'default': '#2563eb',
};

const NATAL_COORDS = { lat: -5.7945, lng: -35.2110 };

// Coordenadas aproximadas por cidade do RN
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Natal': { lat: -5.7945, lng: -35.2110 },
  'Ponta Negra': { lat: -5.8775, lng: -35.1794 },
  'Parnamirim': { lat: -5.9167, lng: -35.2631 },
  'São Gonçalo do Amarante': { lat: -5.7908, lng: -35.3289 },
  'Extremoz': { lat: -5.7058, lng: -35.2564 },
  'Ceará-Mirim': { lat: -5.6378, lng: -35.4250 },
  'Macaíba': { lat: -5.8578, lng: -35.3544 },
  'Nísia Floresta': { lat: -6.0889, lng: -35.2000 },
  'Maracajaú': { lat: -5.4583, lng: -35.2667 },
  'Genipabu': { lat: -5.6333, lng: -35.1833 },
};

function getCityCoords(city: string): { lat: number; lng: number } {
  const found = Object.entries(CITY_COORDS).find(([k]) =>
    city.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(city.toLowerCase())
  );
  if (found) return found[1];
  // Offset aleatório ao redor de Natal para cidades não mapeadas
  return {
    lat: NATAL_COORDS.lat + (Math.random() - 0.5) * 0.3,
    lng: NATAL_COORDS.lng + (Math.random() - 0.5) * 0.3,
  };
}

interface Props {
  attractions: Attraction[];
  locale?: string;
}

export default function AttractionMap({ attractions, locale = 'pt' }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let map: any = null;

    import('leaflet').then((L) => {
      // Fix ícones do Leaflet no Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const container = document.getElementById('attraction-map');
      if (!container) return;
      if ((container as any)._leaflet_id) return;

      map = L.map('attraction-map', {
        center: [NATAL_COORDS.lat, NATAL_COORDS.lng],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      attractions.forEach((attr) => {
        const coords = getCityCoords(attr.city);
        const color = CATEGORY_COLORS[attr.category || ''] || CATEGORY_COLORS.default;

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background: ${color};
            color: white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            width: 32px;
            height: 32px;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 14px;">
              ${attr.category === 'Praia' ? '🏖️' :
                attr.category === 'Aventura' ? '🏄' :
                attr.category === 'Cultural' ? '🏛️' :
                attr.category === 'Ecoturismo' ? '🌿' :
                attr.category === 'Gastronomia' ? '🍽️' :
                attr.category === 'City Tour' ? '🏙️' :
                attr.category === 'Hospedagem' ? '🏨' : '📍'}
            </span>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const rating = attr.averageRating > 0
          ? `${'⭐'.repeat(Math.round(attr.averageRating))} ${attr.averageRating.toFixed(1)}`
          : 'Sem avaliações';

        const popup = L.popup({ maxWidth: 250 }).setContent(`
          <div style="font-family: sans-serif; padding: 4px;">
            ${attr.images?.[0] ? `<img src="${attr.images[0]}" style="width:100%; height:100px; object-fit:cover; border-radius:8px; margin-bottom:8px;" onerror="this.style.display='none'" />` : ''}
            <div style="font-size:13px; font-weight:700; color:#1e293b; margin-bottom:4px; line-height:1.3">${attr.title}</div>
            <div style="font-size:11px; color:#64748b; margin-bottom:4px;">📍 ${attr.city}, ${attr.state}</div>
            <div style="font-size:11px; color:#64748b; margin-bottom:6px;">${rating}</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:13px; font-weight:700; color:#2563eb;">R$ ${attr.price}</span>
              <button onclick="window.location.href='/${locale}/attractions/${attr.id}'"
                style="background:#2563eb; color:white; border:none; border-radius:8px; padding:4px 10px; font-size:11px; cursor:pointer; font-weight:600;">
                Ver detalhes →
              </button>
            </div>
          </div>
        `);

        L.marker([coords.lat, coords.lng], { icon }).addTo(map).bindPopup(popup);
      });
    });

    return () => {
      if (map) { map.remove(); map = null; }
    };
  }, [attractions, locale]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div
        id="attraction-map"
        style={{ height: '500px', width: '100%', borderRadius: '16px', zIndex: 0 }}
      />
    </>
  );
}
