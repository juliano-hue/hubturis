import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { ref, userId, userRole } = await request.json();
    if (!ref || !userId) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });

    const promoters = await prisma.$queryRaw`SELECT id FROM promoters WHERE code = ${ref}` as any[];
    if (promoters.length === 0) return NextResponse.json({ error: 'Código inválido' }, { status: 404 });

    const promoterId = promoters[0].id;

    const existing = await prisma.$queryRaw`
      SELECT id FROM referrals WHERE "userId" = ${userId} AND "promoterId" = ${promoterId}
    ` as any[];
    if (existing.length > 0) return NextResponse.json({ success: true, message: 'já registrado' });

    await prisma.$executeRaw`
      INSERT INTO referrals (id, "promoterId", "userId", "userRole", "createdAt")
      VALUES (gen_random_uuid()::text, ${promoterId}, ${userId}, ${userRole || 'CONSUMER'}, NOW())
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Código obrigatório' }, { status: 400 });

  try {
    const result = await prisma.$queryRaw`
      SELECT p.*,
        COUNT(r.id)::int as "totalReferrals",
        COUNT(CASE WHEN r."userRole" = 'CONSUMER' THEN 1 END)::int as "totalConsumers",
        COUNT(CASE WHEN r."userRole" = 'PROVIDER' THEN 1 END)::int as "totalProviders",
        json_agg(json_build_object('userRole', r."userRole", 'createdAt', r."createdAt") ORDER BY r."createdAt" DESC) as referrals
      FROM promoters p
      LEFT JOIN referrals r ON r."promoterId" = p.id
      WHERE p.code = ${code}
      GROUP BY p.id
    ` as any[];

    if (result.length === 0) return NextResponse.json({ error: 'Código não encontrado' }, { status: 404 });
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
