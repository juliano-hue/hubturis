import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string; locale: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://hubturis.com.br'}/api/attractions/${id}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error('not found');
    const attraction = await res.json();

    const title = attraction.title;
    const description = attraction.description?.slice(0, 155) || `${attraction.title} em ${attraction.city}, ${attraction.state}. Reserve agora no HubTuris.`;
    const image = attraction.images?.[0] || '/og-image.jpg';
    const price = attraction.price;
    const url = `https://hubturis.com.br/${locale}/attractions/${id}`;

    return {
      title,
      description,
      openGraph: {
        title: `${title} | HubTuris`,
        description,
        url,
        type: 'website',
        images: [{ url: image, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | HubTuris`,
        description,
        images: [image],
      },
      other: {
        'product:price:amount': String(price),
        'product:price:currency': 'BRL',
      },
    };
  } catch {
    return {
      title: 'Atração turística em Natal',
      description: 'Descubra experiências turísticas incríveis em Natal e Região no HubTuris.',
    };
  }
}

export default function AttractionLayout({ children }: Props) {
  return <>{children}</>;
}
