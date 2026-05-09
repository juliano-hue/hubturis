import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HubTuris — Experiências Turísticas em Natal',
    short_name: 'HubTuris',
    description: 'Descubra e contrate as melhores experiências turísticas de Natal e Região',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait',
    scope: '/',
    lang: 'pt-BR',
    categories: ['travel', 'lifestyle', 'entertainment'],
    icons: [
      {
        src: '/favicon.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Explorar Atrações',
        url: '/pt/attractions',
        description: 'Ver todas as experiências disponíveis',
      },
      {
        name: 'Minhas Reservas',
        url: '/consumer',
        description: 'Acompanhar suas reservas',
      },
    ],
  };
}
