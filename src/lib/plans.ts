export type PlanType = 'BRONZE' | 'SILVER' | 'GOLD';

export const PLAN_CONFIG: Record<PlanType, {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  price: number;
  searchBoost: number;
  maxAttractions: number | null;
  maxPhotos: number;
  analyticsAccess: boolean;
  featuredBadge: boolean;
  verifiedBadge: boolean;
  homepageBanner: boolean;
  features: string[];
}> = {
  BRONZE: {
    name: 'Bronze',
    emoji: '🥉',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    price: 0,
    searchBoost: 0,
    maxAttractions: 3,
    maxPhotos: 5,
    analyticsAccess: false,
    featuredBadge: false,
    verifiedBadge: false,
    homepageBanner: false,
    features: [
      'Até 3 atrações cadastradas',
      'Até 5 fotos por atração',
      'Presença básica no catálogo',
      'Recebimento de reservas',
    ],
  },
  SILVER: {
    name: 'Prata',
    emoji: '🥈',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-400',
    price: 69,
    searchBoost: 500,
    maxAttractions: 10,
    maxPhotos: 10,
    analyticsAccess: true,
    featuredBadge: true,
    verifiedBadge: false,
    homepageBanner: false,
    features: [
      'Até 10 atrações cadastradas',
      'Até 10 fotos por atração',
      'Badge Prata na listagem',
      'Destaque na busca',
      'Analytics básico de visualizações',
      'Suporte prioritário',
    ],
  },
  GOLD: {
    name: 'Ouro',
    emoji: '🥇',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    price: 159,
    searchBoost: 1000,
    maxAttractions: null,
    maxPhotos: 20,
    analyticsAccess: true,
    featuredBadge: true,
    verifiedBadge: true,
    homepageBanner: true,
    features: [
      'Atrações ilimitadas',
      'Até 20 fotos por atração',
      'Badge Ouro + Verificado',
      'Topo da busca na categoria',
      'Banner na página inicial',
      'Analytics completo',
      'Suporte VIP',
    ],
  },
};

export const BOOST_OPTIONS = [
  { days: 7, price: 19.9, label: '7 dias' },
  { days: 15, price: 34.9, label: '15 dias' },
];

export function getPlanScore(planType: string): number {
  const scores: Record<string, number> = {
    GOLD: 1000,
    SILVER: 500,
    BRONZE: 0,
  };
  return scores[planType] ?? 0;
}

export function calcAttractionScore(params: {
  planType: string;
  averageRating: number;
  featuredUntil: Date | null;
  createdAt: Date;
  hasRecentReview: boolean;
}): number {
  const { planType, averageRating, featuredUntil, createdAt, hasRecentReview } = params;
  let score = getPlanScore(planType);
  score += averageRating * 50;
  if (featuredUntil && featuredUntil > new Date()) score += 300;
  if (hasRecentReview) score += 100;
  const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation <= 30) score += 150;
  return score;
}
