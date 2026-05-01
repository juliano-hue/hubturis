import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { logger } from '@/lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM || 'HubTuris <onboarding@resend.dev>';
// E-mail de teste (enquanto domínio não está verificado)
const TEST_EMAIL = 'juliano@jrerzinger.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text, type, bookingData, originalTo } = body;

    // Forçar envio para e-mail de teste enquanto domínio não está verificado
    const emailTo = TEST_EMAIL;
    
    logger.info(`Enviando email: ${type || 'notificacao'} para ${emailTo} (original: ${to || 'não informado'})`);

    let emailSubject = subject;
    let emailHtml = html;
    let emailText = text;

    // Template de confirmação de reserva
    if (type === 'booking_confirmation' && bookingData) {
      emailSubject = `✅ Reserva Confirmada - ${bookingData.attractionTitle}`;
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px; }
            .detail { margin: 15px 0; padding: 10px; background: white; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏖️ HubTuris</h1>
              <p>Reserva Confirmada!</p>
            </div>
            <div class="content">
              <h2>Olá, ${bookingData.userName || 'Viajante'}!</h2>
              <p>Sua reserva foi confirmada com sucesso. Aqui estão os detalhes:</p>
              
              <div class="detail">
                <strong>🎟️ Atração:</strong> ${bookingData.attractionTitle}<br>
                <strong>📅 Data:</strong> ${new Date(bookingData.date).toLocaleDateString('pt-BR')}<br>
                <strong>👥 Participantes:</strong> ${bookingData.participants}<br>
                <strong>💰 Valor total:</strong> R$ ${bookingData.totalPrice.toFixed(2)}
              </div>
              
              <p>Você pode gerenciar sua reserva acessando seu dashboard:</p>
              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/consumer" class="button">Ver minhas reservas</a>
              </p>
              <p style="font-size: 14px; color: #6b7280;">🔒 Cancelamento gratuito até 24h antes da data da atividade.</p>
            </div>
            <div class="footer">
              <p>© 2026 HubTuris - Sua plataforma de turismo</p>
            </div>
          </div>
        </body>
        </html>
      `;
      emailText = `Reserva confirmada! ${bookingData.attractionTitle} em ${new Date(bookingData.date).toLocaleDateString('pt-BR')} para ${bookingData.participants} pessoa(s). Total: R$ ${bookingData.totalPrice.toFixed(2)}`;
    }

    // Template de cancelamento
    if (type === 'booking_cancelled' && bookingData) {
      emailSubject = `⚠️ Reserva Cancelada - ${bookingData.attractionTitle}`;
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏖️ HubTuris</h1>
              <p>Reserva Cancelada</p>
            </div>
            <div class="content">
              <h2>Olá, ${bookingData.userName || 'Viajante'}!</h2>
              <p>Sua reserva para <strong>${bookingData.attractionTitle}</strong> foi cancelada com sucesso.</p>
              <p>O reembolso será processado em até 5 dias úteis.</p>
              <p>Esperamos você em uma próxima aventura!</p>
            </div>
            <div class="footer">
              <p>© 2026 HubTuris - Sua plataforma de turismo</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: emailTo,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      logger.error('Erro ao enviar email', { error });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.info(`Email enviado com sucesso: ${data?.id}`);
    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    logger.error('Erro ao enviar email', { error });
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 });
  }
}