import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prismadb";

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prismadb.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (user) return user.id;
  }

  const headerId = req.headers.get('x-user-id');
  if (headerId) return headerId;

  const { searchParams } = new URL(req.url);
  const queryId = searchParams.get('userId');
  if (queryId) return queryId;

  return null;
}

// Extrai apenas os últimos 4 dígitos do número do cartão
function maskCardNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 4) return null;
  return digits.slice(-4);
}

async function handleSave(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, cpf, phone, address, city, state, paymentType, cardNumber, cardExpiry, cardBrand } = body;
    // cardCvv é ignorado — CVV jamais pode ser armazenado (PCI DSS)

    const cardLastFour = maskCardNumber(cardNumber);

    const updatedProfile = await prismadb.consumerProfile.upsert({
      where: { userId },
      update: { fullName, cpf, phone, address, city, state, paymentType, cardLastFour, cardExpiry, cardBrand },
      create: {
        userId,
        fullName,
        cpf: cpf || '',
        phone: phone || '',
        address: address || '',
        city: city || '',
        state: state || '',
        paymentType: paymentType || 'PIX',
        cardLastFour,
        cardExpiry,
        cardBrand,
      },
    });

    // Nunca retornar dados completos de cartão — apenas os últimos 4 dígitos
    const { ...safeProfile } = updatedProfile;
    return NextResponse.json({ success: true, profile: safeProfile });
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prismadb.user.findUnique({
      where: { id: userId },
      include: { consumerProfile: true },
    });

    if (!user?.consumerProfile) {
      return NextResponse.json(null, { status: 200 });
    }

    // Retorna o perfil sem nenhum campo sensível completo de cartão
    const { ...safeProfile } = user.consumerProfile;
    return NextResponse.json(safeProfile);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return handleSave(req);
}

export async function POST(req: NextRequest) {
  return handleSave(req);
}
