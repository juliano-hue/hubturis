import { NextRequest, NextResponse } from 'next/server';
import { prismadb } from '@/lib/prismadb';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const profile = await prismadb.providerProfile.findUnique({
      where: { userId },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Erro ao buscar perfil do provider:', error);
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, cpf, phone, address, city, state, zipCode, bankName, agency, accountNumber, accountType, pixKey } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const profile = await prismadb.providerProfile.upsert({
      where: { userId },
      update: {
        fullName,
        cpf,
        phone,
        address,
        city,
        state,
        zipCode,
        bankName,
        agency,
        accountNumber,
        accountType,
        pixKey,
      },
      create: {
        userId,
        fullName,
        cpf,
        phone,
        address,
        city,
        state,
        zipCode,
        bankName,
        agency,
        accountNumber,
        accountType,
        pixKey,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Erro ao salvar perfil do provider:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}