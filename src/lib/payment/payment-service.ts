import Stripe from 'stripe';
import { MercadoPagoConfig, Payment as MPPayment, Preference } from 'mercadopago';
import { CreatePaymentIntentRequest, PaymentIntentResponse, PaymentProvider } from './types';
import prismadb from '@/lib/prismadb';

// Configuração Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

// Configuração Mercado Pago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export class PaymentService {
  
  // Stripe: Criar intenção de pagamento
  static async createStripeIntent(
    bookingId: string, 
    amount: number, 
    email?: string
  ): Promise<PaymentIntentResponse> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'brl',
      metadata: { bookingId },
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
    });

    await prismadb.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'PENDING', status: 'PENDING' },
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      status: 'pending',
    };
  }

  // Mercado Pago: Criar preferência
  static async createMercadoPagoPreference(
    bookingId: string,
    amount: number,
    title: string,
    email?: string,
    name?: string
  ): Promise<PaymentIntentResponse> {
    const preference = new Preference(mercadopago);
    
    const body = {
      items: [{
        id: bookingId,
        title: title.substring(0, 255),
        quantity: 1,
        unit_price: amount,
        currency_id: 'BRL',
      }],
      payer: { email, name },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/webhook/mercadopago`,
      external_reference: bookingId,
    };

    const response = await preference.create({ body });
    const preferenceData = response as any;

    await prismadb.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'PENDING', status: 'PENDING' },
    });

    return {
      id: preferenceData.id,
      preferenceId: preferenceData.id,
      paymentUrl: preferenceData.init_point,
      status: 'pending',
    };
  }

  // Método unificado
  static async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    const { bookingId, amount, paymentMethod, customerEmail, customerName } = request;
    
    const booking = await prismadb.booking.findUnique({
      where: { id: bookingId },
      include: { attraction: true },
    });
    
    const title = booking?.attraction.title || 'Reserva HubTuris';

    if (paymentMethod === 'stripe') {
      return this.createStripeIntent(bookingId, amount, customerEmail);
    } else {
      return this.createMercadoPagoPreference(bookingId, amount, title, customerEmail, customerName);
    }
  }

  // Confirmar pagamento (webhook)
  static async confirmPayment(provider: PaymentProvider, externalId: string): Promise<void> {
    let status: 'PAID' | 'FAILED' | 'PENDING' = 'PENDING';
    let bookingId: string | null = null;

    if (provider === 'stripe') {
      const paymentIntent = await stripe.paymentIntents.retrieve(externalId);
      status = paymentIntent.status === 'succeeded' ? 'PAID' : 
               paymentIntent.status === 'requires_payment_method' ? 'FAILED' : 'PENDING';
      bookingId = paymentIntent.metadata.bookingId;
    } else {
      // Mercado Pago
      const payment = await new MPPayment(mercadopago).get({ id: externalId });
      const paymentData = payment as any;
      status = paymentData.status === 'approved' ? 'PAID' :
               paymentData.status === 'rejected' ? 'FAILED' : 'PENDING';
      bookingId = paymentData.external_reference;
    }

    if (bookingId && status === 'PAID') {
      await prismadb.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        },
      });
    }
  }
}