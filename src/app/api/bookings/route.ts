import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prismadb from '@/lib/prismadb';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

const bookingRateLimit = rateLimit({ windowMs: 60 * 1000, maxRequests: 10 });

// GET - Listar reservas do usuário logado
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // CORREÇÃO: Verificar se o usuário existe e tem ID
    const userId = (session?.user as any)?.id || req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Suporte a providerId via query param (extrato financeiro)
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get('providerId');
    if (providerId) {
      const bookings = await prismadb.booking.findMany({
        where: { attraction: { providerId } },
        include: {
          attraction: { select: { id: true, title: true, city: true, state: true } },
          consumer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(bookings);
    }

    const userRole = (session?.user as any)?.role || 'CONSUMER';

    let bookings;

    if (userRole === 'PROVIDER') {
      // Provider vê reservas das suas atrações
      bookings = await prismadb.booking.findMany({
        where: {
          attraction: {
            providerId: userId
          }
        },
        include: {
          attraction: true,
          consumer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // Consumer vê suas próprias reservas
      bookings = await prismadb.booking.findMany({
        where: {
          consumerId: userId
        },
        include: {
          attraction: {
            include: {
              provider: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json({ error: 'Erro ao buscar reservas' }, { status: 500 });
  }
}

// POST - Criar nova reserva
export async function POST(req: NextRequest) {
  const limited = bookingRateLimit(req);
  if (limited) return limited;

  try {
    // Aceita NextAuth session OU x-user-id header (localStorage auth)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    
    const {
      attractionId,
      date,
      participants,
      totalPrice,
      specialRequests
    } = body;

    // Validações
    if (!attractionId || !date || !participants || !totalPrice) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Verificar se a atração existe
    const attraction = await prismadb.attraction.findUnique({
      where: { id: attractionId },
      include: {
        provider: {
          select: {
            id: true,
 
            name: true,
            email: true
          }
        }
      }
    });

    if (!attraction) {
      return NextResponse.json({ error: 'Atração não encontrada' }, { status: 404 });
    }

    // Verificar disponibilidade e vagas restantes
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(bookingDate); endOfDay.setHours(23,59,59,999);

    // Busca a disponibilidade cadastrada pelo ofertante para este dia
    const availability = await prismadb.availability.findFirst({
      where: {
        attractionId,
        date: { gte: startOfDay, lte: endOfDay },
        isAvailable: true,
      }
    });

    if (!availability) {
      return NextResponse.json({ error: 'Data não disponível para reserva' }, { status: 400 });
    }

    // Soma participantes de reservas ativas nesta data
    const existingAgg = await prismadb.booking.aggregate({
      where: {
        attractionId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ['CANCELLED', 'REJECTED'] },
      },
      _sum: { participants: true },
    });

    const alreadyBooked = existingAgg._sum.participants || 0;
    const remaining = availability.maxParticipants - alreadyBooked;

    if (participants > remaining) {
      return NextResponse.json({
        error: `Vagas insuficientes. Restam apenas ${remaining} vaga(s) para esta data.`
      }, { status: 400 });
    }

    // Se ficou sem vagas após essa reserva, marca a data como indisponível
    if (alreadyBooked + participants >= availability.maxParticipants) {
      await prismadb.availability.update({
        where: { id: availability.id },
        data: { isAvailable: false },
      });
    }

    // Criar a reserva
    const booking = await prismadb.booking.create({
      data: {
        attractionId,
        consumerId: userId,
        date: new Date(date),
        participants,
        totalPrice,
        specialRequests: specialRequests || null,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        attraction: {
          select: {
            id: true,
            title: true,
            providerId: true
          }
        }
      }
    });

    // Converter data para string ISO para o e-mail
    const dateString = booking.date instanceof Date ? booking.date.toISOString() : new Date(booking.date).toISOString();

    // ========== ENVIAR E-MAIL DE CONFIRMAÇÃO ==========
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      const emailResponse = await fetch(`${appUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking_confirmation',
          to: booking.consumer.email,
          bookingData: {
            attractionTitle: attraction.title,
            date: dateString,
            participants: booking.participants,
            totalPrice: booking.totalPrice,
            userName: booking.consumer.name || 'Viajante'
          }
        })
      });

      if (emailResponse.ok) {
        console.log(`✅ E-mail de confirmação enviado para: ${booking.consumer.email}`);
      } else {
        const emailError = await emailResponse.text();
        console.error(`❌ Falha ao enviar e-mail: ${emailError}`);
      }
    } catch (emailError) {
      console.error('❌ Erro ao enviar e-mail de confirmação:', emailError);
      // Não interrompe o fluxo - a reserva já foi criada
    }
    // ==================================================

    return NextResponse.json(booking, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    return NextResponse.json({ error: 'Erro ao criar reserva' }, { status: 500 });
  }
}