import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const provider = req.headers.get('x-payment-provider') || 'stripe';
    
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const mercadoPagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    const hasStripe = stripeSecretKey && stripeSecretKey !== 'sk_test_placeholder';
    const hasMercadoPago = mercadoPagoToken && mercadoPagoToken !== 'TEST-xxxxxxxxxxxx-xxxxxx';
    
    // Se nenhum provedor de pagamento está configurado, apenas loga e retorna sucesso (mock)
    if (!hasStripe && !hasMercadoPago) {
      console.log('⚠️ Webhook: nenhum provedor de pagamento configurado. Modo mock.');
      console.log('Webhook recebido (mock):', { provider, bodyLength: body.length });
      return NextResponse.json({ received: true, mock: true });
    }
    
    // Se Stripe está configurado e o webhook é do Stripe
    if (provider === 'stripe' && hasStripe) {
      const Stripe = require('stripe');
      const stripe = new Stripe(stripeSecretKey);
      const webhookSecret = stripeWebhookSecret || '';
      
      let event;
      try {
        event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
      } catch (err) {
        console.error('Erro ao construir evento Stripe:', err);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
      }
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log('✅ Pagamento confirmado (Stripe):', paymentIntent.id);
          // Aqui você pode atualizar o status da reserva no banco de dados
          break;
        case 'payment_intent.payment_failed':
          console.log('❌ Pagamento falhou (Stripe):', event.data.object.id);
          break;
        default:
          console.log(`Evento Stripe não tratado: ${event.type}`);
      }
      
      return NextResponse.json({ received: true });
    }
    
    // Se Mercado Pago está configurado (simulação – ajuste conforme sua integração)
    if (provider === 'mercadopago' && hasMercadoPago) {
      console.log('Webhook Mercado Pago recebido (mock parcial):', { bodyLength: body.length });
      // Aqui você implementaria a lógica real do Mercado Pago
      return NextResponse.json({ received: true });
    }
    
    // Fallback para provedor não reconhecido
    console.log('⚠️ Provedor de pagamento não suportado ou não configurado:', provider);
    return NextResponse.json({ received: true, mock: true });
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Webhook error', mock: true },
      { status: 400 }
    );
  }
}