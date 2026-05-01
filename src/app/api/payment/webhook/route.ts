import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PaymentService } from '@/lib/payment/payment-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const provider = req.headers.get('x-payment-provider') || 'stripe';

    if (provider === 'stripe') {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
      const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        await PaymentService.confirmPayment('stripe', paymentIntent.id);
      }
    } else {
      // Mercado Pago
      const paymentData = JSON.parse(body);
      await PaymentService.confirmPayment('mercadopago', paymentData.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}