import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismadb } from "@/lib/prismadb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prismadb.user.findUnique({
      where: { email: session.user.email },
      include: { consumerProfile: true },
    });

    if (!user?.consumerProfile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    return NextResponse.json(user.consumerProfile);
  } catch (error) {
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return handleSave(req);
}

export async function POST(req: NextRequest) {
  return handleSave(req);
}

async function handleSave(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, cpf, phone, address, city, state, paymentType, cardNumber, cardExpiry, cardCvv, cardBrand } = body;

    const user = await prismadb.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const updatedProfile = await prismadb.consumerProfile.upsert({
      where: { userId: user.id },
      update: { fullName, cpf, phone, address, city, state, paymentType, cardNumber, cardExpiry, cardCvv, cardBrand },
      create: { userId: user.id, fullName, cpf, phone, address, city, state, paymentType, cardNumber, cardExpiry, cardCvv, cardBrand },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}