import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { consumerProfile: true },
    });

    if (!user?.consumerProfile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    return NextResponse.json(user.consumerProfile);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, cpf, phone, address, city, state, paymentType, cardNumber, cardExpiry, cardCvv, cardBrand } = body;

    // Busca o user para pegar o id
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { consumerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Atualiza ou cria o perfil do consumidor
    const updatedProfile = await prisma.consumerProfile.upsert({
      where: { userId: user.id },
      update: {
        fullName,
        cpf,
        phone,
        address,
        city,
        state,
        paymentType,
        cardNumber,
        cardExpiry,
        cardCvv,
        cardBrand,
      },
      create: {
        userId: user.id,
        fullName,
        cpf,
        phone,
        address,
        city,
        state,
        paymentType,
        cardNumber,
        cardExpiry,
        cardCvv,
        cardBrand,
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    return NextResponse.json(
      { error: "Erro ao salvar perfil. Tente novamente." },
      { status: 500 }
    );
  }
}