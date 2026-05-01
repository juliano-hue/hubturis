import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prismadb from '@/lib/prismadb';
import { authOptions } from '@/lib/auth';

// GET - Listar reservas do usuário logado
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // CORREÇÃO: Verificar se o usuário existe e tem ID
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userRole = (session?.user as any)?.role;

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
  try {
    const session = await getServerSession(authOptions);
    
    // CORREÇÃO: Verificar se o usuário existe e tem ID
    const userId = (session?.user as any)?.id;
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

    // Verificar disponibilidade (opcional - ajuste conforme sua lógica)
    const existingBooking = await prismadb.booking.findFirst({
      where: {
        attractionId,
        date: new Date(date),
        status: { not: 'CANCELLED' }
      }
    });

    if (existingBooking) {
      return NextResponse.json({ error: 'Data indisponível' }, { status: 400 });
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