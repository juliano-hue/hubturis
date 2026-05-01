import { logger } from './logger';

interface SendEmailParams {
  to: string;
  type: 'booking_confirmation' | 'booking_cancelled' | 'welcome' | 'reset_password';
  bookingData?: {
    id: string;
    attractionTitle: string;
    date: string;
    participants: number;
    totalPrice: number;
    userName?: string;
  };
  userName?: string;
}

export async function sendEmail({ to, type, bookingData, userName }: SendEmailParams) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        type,
        bookingData: bookingData ? { ...bookingData, userName } : undefined,
        userName,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao enviar email');
    }
    
    logger.info(`Email ${type} enviado para ${to}`);
    return { success: true };
  } catch (error) {
    logger.error(`Erro ao enviar email ${type} para ${to}`, { error });
    return { success: false, error };
  }
}