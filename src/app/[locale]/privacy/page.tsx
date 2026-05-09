import Link from 'next/link';

const content = {
  pt: {
    title: 'Política de Privacidade',
    updated: 'Última atualização: maio de 2026 — em conformidade com a LGPD (Lei nº 13.709/2018)',
    back: '← Voltar ao início',
    terms: 'Termos de Uso',
    sections: [
      { title: '1. Controlador dos Dados', text: 'O HubTuris é o controlador dos dados pessoais coletados nesta plataforma. Contato: privacidade@hubturis.com.br' },
      { title: '2. Dados Coletados', items: ['Dados de cadastro: nome, e-mail, senha (criptografada), perfil', 'Dados de perfil: CPF, telefone, endereço, cidade, estado', 'Dados financeiros do ofertante: dados bancários, chave PIX', 'Dados de uso: histórico de reservas, atrações visitadas, avaliações', 'Dados técnicos: endereço IP, tipo de dispositivo, navegador'] },
      { title: '3. Finalidade do Tratamento', items: ['Prestação dos serviços da plataforma (cadastro, reservas, pagamentos)', 'Comunicação sobre reservas, confirmações e cancelamentos', 'Repasse financeiro aos ofertantes', 'Melhoria contínua da plataforma', 'Cumprimento de obrigações legais', 'Prevenção de fraudes e segurança da plataforma'] },
      { title: '4. Base Legal', items: ['Consentimento: para envio de comunicações e marketing', 'Execução de contrato: para processar reservas e pagamentos', 'Legítimo interesse: para segurança e prevenção de fraudes', 'Obrigação legal: para cumprimento de exigências fiscais e regulatórias'] },
      { title: '5. Compartilhamento de Dados', items: ['Gateways de pagamento (Asaas, Efí Bank, Stripe, PayPal) — para processamento de transações', 'Serviços de e-mail (Resend) — para envio de notificações', 'Autoridades públicas — quando exigido por lei', 'Nunca vendemos seus dados a terceiros para fins comerciais'] },
      { title: '6. Retenção dos Dados', items: ['Dados de conta: mantidos enquanto a conta estiver ativa', 'Dados de transações: mantidos por 5 anos (obrigação fiscal)', 'Dados de acesso: mantidos por 6 meses (segurança)', 'Após encerramento da conta, os dados são anonimizados ou excluídos'] },
      { title: '7. Seus Direitos (LGPD)', items: ['Confirmação e acesso: saber se tratamos seus dados e acessá-los', 'Correção: corrigir dados incompletos ou desatualizados', 'Eliminação: solicitar a exclusão dos seus dados', 'Portabilidade: receber seus dados em formato estruturado', 'Revogação do consentimento: retirar o consentimento a qualquer momento'] },
      { title: '8. Segurança dos Dados', items: ['Senhas armazenadas com criptografia bcrypt', 'Comunicação via HTTPS/TLS', 'Banco de dados com acesso restrito e autenticado', 'Monitoramento contínuo de segurança'] },
      { title: '9. Cookies', text: 'Utilizamos cookies essenciais para o funcionamento da plataforma (autenticação e sessão). Não utilizamos cookies de rastreamento de terceiros para publicidade.' },
      { title: '10. Contato e DPO', text: 'Para questões de privacidade: privacidade@hubturis.com.br | ANPD: www.gov.br/anpd' },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: May 2026 — in compliance with Brazil\'s LGPD (Law No. 13,709/2018)',
    back: '← Back to home',
    terms: 'Terms of Use',
    sections: [
      { title: '1. Data Controller', text: 'HubTuris is the controller of personal data collected on this platform. Contact: privacidade@hubturis.com.br' },
      { title: '2. Data Collected', items: ['Registration data: name, email, password (encrypted), profile type', 'Profile data: CPF (tax ID), phone, address, city, state', 'Provider financial data: bank details, PIX key', 'Usage data: booking history, attractions visited, reviews', 'Technical data: IP address, device type, browser'] },
      { title: '3. Purpose of Processing', items: ['Provision of platform services (registration, bookings, payments)', 'Communication about bookings, confirmations and cancellations', 'Financial transfers to providers', 'Continuous improvement of the platform', 'Compliance with legal obligations', 'Fraud prevention and platform security'] },
      { title: '4. Legal Basis', items: ['Consent: for sending communications and marketing', 'Contract performance: for processing bookings and payments', 'Legitimate interest: for security and fraud prevention', 'Legal obligation: for compliance with tax and regulatory requirements'] },
      { title: '5. Data Sharing', items: ['Payment gateways (Asaas, Efí Bank, Stripe, PayPal) — for transaction processing', 'Email services (Resend) — for sending notifications', 'Public authorities — when required by law', 'We never sell your data to third parties for commercial purposes'] },
      { title: '6. Data Retention', items: ['Account data: retained while the account is active', 'Transaction data: retained for 5 years (tax obligation)', 'Access data: retained for 6 months (security)', 'Upon account closure, data is anonymized or deleted'] },
      { title: '7. Your Rights (LGPD)', items: ['Confirmation and access: to know if we process your data and access it', 'Correction: to correct incomplete or outdated data', 'Deletion: to request deletion of your data', 'Portability: to receive your data in a structured format', 'Revocation of consent: to withdraw consent at any time'] },
      { title: '8. Data Security', items: ['Passwords stored with bcrypt encryption', 'Communication via HTTPS/TLS', 'Database with restricted and authenticated access', 'Continuous security monitoring'] },
      { title: '9. Cookies', text: 'We use essential cookies for platform operation (authentication and session). We do not use third-party tracking cookies for advertising.' },
      { title: '10. Contact and DPO', text: 'For privacy matters: privacidade@hubturis.com.br | ANPD (Brazilian Data Protection Authority): www.gov.br/anpd' },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    updated: 'Última actualización: mayo de 2026 — conforme a la LGPD de Brasil (Ley N° 13.709/2018)',
    back: '← Volver al inicio',
    terms: 'Términos de Uso',
    sections: [
      { title: '1. Responsable del Tratamiento', text: 'HubTuris es el responsable del tratamiento de los datos personales recopilados en esta plataforma. Contacto: privacidade@hubturis.com.br' },
      { title: '2. Datos Recopilados', items: ['Datos de registro: nombre, correo electrónico, contraseña (cifrada), perfil', 'Datos de perfil: CPF (identificación fiscal), teléfono, dirección, ciudad, estado', 'Datos financieros del proveedor: datos bancarios, clave PIX', 'Datos de uso: historial de reservas, atracciones visitadas, reseñas', 'Datos técnicos: dirección IP, tipo de dispositivo, navegador'] },
      { title: '3. Finalidad del Tratamiento', items: ['Prestación de los servicios de la plataforma (registro, reservas, pagos)', 'Comunicación sobre reservas, confirmaciones y cancelaciones', 'Transferencias financieras a los proveedores', 'Mejora continua de la plataforma', 'Cumplimiento de obligaciones legales', 'Prevención de fraudes y seguridad de la plataforma'] },
      { title: '4. Base Legal', items: ['Consentimiento: para el envío de comunicaciones y marketing', 'Ejecución del contrato: para procesar reservas y pagos', 'Interés legítimo: para seguridad y prevención de fraudes', 'Obligación legal: para el cumplimiento de requisitos fiscales y regulatorios'] },
      { title: '5. Compartición de Datos', items: ['Pasarelas de pago (Asaas, Efí Bank, Stripe, PayPal) — para el procesamiento de transacciones', 'Servicios de correo electrónico (Resend) — para el envío de notificaciones', 'Autoridades públicas — cuando lo exija la ley', 'Nunca vendemos sus datos a terceros con fines comerciales'] },
      { title: '6. Retención de Datos', items: ['Datos de cuenta: conservados mientras la cuenta esté activa', 'Datos de transacciones: conservados durante 5 años (obligación fiscal)', 'Datos de acceso: conservados durante 6 meses (seguridad)', 'Tras el cierre de la cuenta, los datos se anonimizan o eliminan'] },
      { title: '7. Sus Derechos (LGPD)', items: ['Confirmación y acceso: saber si tratamos sus datos y acceder a ellos', 'Corrección: corregir datos incompletos o desactualizados', 'Eliminación: solicitar la eliminación de sus datos', 'Portabilidad: recibir sus datos en formato estructurado', 'Revocación del consentimiento: retirar el consentimiento en cualquier momento'] },
      { title: '8. Seguridad de los Datos', items: ['Contraseñas almacenadas con cifrado bcrypt', 'Comunicación mediante HTTPS/TLS', 'Base de datos con acceso restringido y autenticado', 'Monitoreo continuo de seguridad'] },
      { title: '9. Cookies', text: 'Utilizamos cookies esenciales para el funcionamiento de la plataforma (autenticación y sesión). No utilizamos cookies de seguimiento de terceros para publicidad.' },
      { title: '10. Contacto y DPO', text: 'Para cuestiones de privacidad: privacidade@hubturis.com.br | ANPD (Autoridad Nacional de Protección de Datos de Brasil): www.gov.br/anpd' },
    ],
  },
} as const;

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = (locale in content ? locale : 'pt') as keyof typeof content;
  const c = content[lang];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">{c.back}</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{c.title}</h1>
        <p className="text-gray-500 text-sm mb-8">{c.updated}</p>
        <div className="space-y-8 text-gray-700">
          {c.sections.map((s: any) => (
            <section key={s.title}>
              <h2 className="text-xl font-bold text-gray-800 mb-3">{s.title}</h2>
              {s.text && <p>{s.text}</p>}
              {s.items && (
                <ul className="list-disc pl-6 space-y-2">
                  {s.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-gray-200 flex gap-4">
          <Link href={`/${locale}/terms`} className="text-blue-600 hover:underline text-sm">{c.terms}</Link>
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">{c.back}</Link>
        </div>
      </div>
    </div>
  );
}
