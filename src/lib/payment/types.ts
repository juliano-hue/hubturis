export type PaymentProvider = 'stripe' | 'mercadopago';

export interface PaymentMethod {
  id: string;
  name: string;
  provider: PaymentProvider;
  icon: string;
  description: string;
}

export interface CreatePaymentIntentRequest {
  bookingId: string;
  amount: number;
  currency: 'BRL';
  paymentMethod: PaymentProvider;
  customerEmail?: string;
  customerName?: string;
}

export interface PaymentIntentResponse {
  id: string;
  clientSecret?: string;
  preferenceId?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  copyCode?: string;
  paymentUrl?: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
}