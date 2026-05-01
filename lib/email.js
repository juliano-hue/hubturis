// lib/email.js
const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envia um e-mail usando o Resend
 * @param {Object} params - Parâmetros do e-mail
 * @param {string} params.to - E-mail do destinatário
 * @param {string} params.subject - Assunto do e-mail
 * @param {string} params.html - Conteúdo HTML do e-mail
 * @returns {Promise<Object>} - Resposta do Resend
 */
async function enviarEmail({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Erro ao enviar e-mail:', error);
      return { success: false, error };
    }

    console.log(`✅ E-mail enviado para ${to} - ID: ${data.id}`);
    return { success: true, data };
  } catch (error) {
    console.error('Erro inesperado:', error.message);
    return { success: false, error: error.message };
  }
}

// Teste rápido se executar diretamente
if (require.main === module) {
  enviarEmail({
    to: 'juliano@jrerzinger.com',
    subject: 'Teste - Função de E-mail HubTuris',
    html: '<h1>Funcionou!</h1><p>Sua função de e-mail está pronta para uso.</p>'
  }).then(result => {
    if (result.success) console.log('✅ Teste concluído!');
    else console.log('❌ Falha no teste');
  });
}

module.exports = { enviarEmail };