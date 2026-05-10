import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prismadb";

// Resolve userId tanto via NextAuth session quanto via header/query (localStorage auth)
async function resolveUserId(req: NextRequest): Promise<string | null> {
  // 1. Tenta NextAuth session
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prismadb.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (user) return user.id;
  }

  // 2. Fallback: header x-user-id ou query param userId
  const headerId = req.headers.get('x-user-id');
  if (headerId) return headerId;

  const { searchParams } = new URL(req.url);
  const queryId = searchParams.get('userId');
  if (queryId) return queryId;

  return null;
}

async function handleSave(req: NextRequest) {
  try {
    const userId = await resolveUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, cpf, phone, address, city, state, paymentType, cardNumber, cardExpiry, cardCvv, cardBrand } = body;

    const updatedProfile = await prismadb.consumerProfile.upsert({
      where: { userId },
      update: { fullName, cpf, phone, address, city, state, paymentType, cardNumber, cardExpiry, cardCvv, cardBrand },
      create: { userId, fullName, cpf: cpf || '', phone: phone || '', address: address || '', city: city || '', state: state || '', paymentType: paymentType || 'PIX', cardNumber, cardExpiry, cardCvv, cardBrand },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
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
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    return NextResponse.json({ profile: user.consumerProfile });
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
