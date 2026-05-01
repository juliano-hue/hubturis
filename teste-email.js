const { Resend } = require('resend');

// SUA API KEY DIRETAMENTE AQUI
const RESEND_API_KEY = 're_YaKQWMNP_9Muf87eKYRCCvG7vuFRt3VTV';

const resend = new Resend(RESEND_API_KEY);

async function sendTestEmail() {
  console.log('📧 Enviando e-mail de teste...\n');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'TuriSHub <onboarding@resend.dev>',
      to: ['juliano@jrerzinger.com'], // ← Coloque seu e-mail aqui
      subject: '✅ Teste - TuriSHub integração com Resend',
      html: `
        <div style="font-family: Arial; max-width: 500px;">
          <h2 style="color: #0066cc;">TuriSHub</h2>
          <p>Olá! Este é um e-mail de teste enviado via API do Resend.</p>
          <p>✅ Sua integração está funcionando perfeitamente!</p>
          <hr>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      `,
    });
    
    if (error) {
      console.error('❌ Erro ao enviar:', error);
    } else {
      console.log('✅ E-mail enviado com sucesso!');
      console.log('📨 ID do e-mail:', data?.id);
      console.log('\n📩 Verifique sua caixa de entrada (ou SPAM)');
    }
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

sendTestEmail();