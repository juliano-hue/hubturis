import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateCode(name: string): string {
  const base = name.toUpperCase().replace(/\s+/g, '').slice(0, 6);
  const num = Math.floor(Math.random() * 900) + 100;
  return `${base}${num}`;
}

export async function GET() {
  try {
    const promoters = await prisma.$queryRaw`
      SELECT p.*,
        COUNT(r.id)::int as "totalReferrals",
        COUNT(CASE WHEN r."userRole" = 'CONSUMER' THEN 1 END)::int as "totalConsumers",
        COUNT(CASE WHEN r."userRole" = 'PROVIDER' THEN 1 END)::int as "totalProviders"
      FROM promoters p
      LEFT JOIN referrals r ON r."promoterId" = p.id
      GROUP BY p.id
      ORDER BY p."createdAt" DESC
    `;
    return NextResponse.json(promoters);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json();
    if (!name || !email) return NextResponse.json({ error: 'Nome e email obrigatórios' }, { status: 400 });

    let code = generateCode(name);
    // garante unicidade
    const existing = await prisma.$queryRaw`SELECT id FROM promoters WHERE code = ${code}` as any[];
    if (existing.length > 0) code = generateCode(name + Date.now());

    await prisma.$executeRaw`
      INSERT INTO promoters (id, name, email, code, phone, "createdAt")
      VALUES (gen_random_uuid()::text, ${name}, ${email}, ${code}, ${phone || null}, NOW())
    `;

    const promoter = await prisma.$queryRaw`SELECT * FROM promoters WHERE code = ${code}` as any[];
    return NextResponse.json(promoter[0]);
  } catch (error: any) {
    if (error.message?.includes('unique')) return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
