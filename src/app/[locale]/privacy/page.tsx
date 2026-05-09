import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">← Voltar ao início</Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-gray-500 text-sm mb-8">Última atualização: maio de 2026 — em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. Controlador dos Dados</h2>
            <p>O HubTuris é o controlador dos dados pessoais coletados nesta plataforma. Para contato relacionado à privacidade: <a href="mailto:privacidade@hubturis.com.br" className="text-blue-600 hover:underline">privacidade@hubturis.com.br</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. Dados Coletados</h2>
            <p>Coletamos os seguintes dados pessoais:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dados de cadastro:</strong> nome, e-mail, senha (criptografada), perfil (consumidor ou ofertante)</li>
              <li><strong>Dados de perfil:</strong> CPF, telefone, endereço, cidade, estado</li>
              <li><strong>Dados financeiros do ofertante:</strong> dados bancários, chave PIX (para repasse de valores)</li>
              <li><strong>Dados de uso:</strong> histórico de reservas, atrações visitadas, avaliações</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de dispositivo, navegador (para segurança e analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">3. Finalidade do Tratamento</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prestação dos serviços da plataforma (cadastro, reservas, pagamentos)</li>
              <li>Comunicação sobre reservas, confirmações e cancelamentos</li>
              <li>Repasse financeiro aos ofertantes</li>
              <li>Melhoria contínua da plataforma</li>
              <li>Cumprimento de obrigações legais</li>
              <li>Prevenção de fraudes e segurança da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. Base Legal</h2>
            <p>O tratamento dos dados é realizado com base nas seguintes hipóteses legais (Art. 7º da LGPD):</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Consentimento:</strong> para envio de comunicações e marketing</li>
              <li><strong>Execução de contrato:</strong> para processar reservas e pagamentos</li>
              <li><strong>Legítimo interesse:</strong> para segurança e prevenção de fraudes</li>
              <li><strong>Obrigação legal:</strong> para cumprimento de exigências fiscais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">5. Compartilhamento de Dados</h2>
            <p>Seus dados podem ser compartilhados com:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Gateways de pagamento</strong> (Asaas, Efí Bank, Stripe, PayPal) — para processamento de transações</li>
              <li><strong>Serviços de e-mail</strong> (Resend) — para envio de notificações</li>
              <li><strong>Autoridades públicas</strong> — quando exigido por lei</li>
              <li>Nunca vendemos seus dados a terceiros para fins comerciais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">6. Retenção dos Dados</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dados de conta: mantidos enquanto a conta estiver ativa</li>
              <li>Dados de transações: mantidos por 5 anos (obrigação fiscal)</li>
              <li>Dados de acesso: mantidos por 6 meses (segurança)</li>
              <li>Após encerramento da conta, os dados são anonimizados ou excluídos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">7. Seus Direitos (LGPD)</h2>
            <p>Você tem os seguintes direitos sobre seus dados:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> corrigir dados incompletos ou desatualizados</li>
              <li><strong>Eliminação:</strong> solicitar a exclusão dos seus dados</li>
              <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
              <li><strong>Revogação do consentimento:</strong> retirar o consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> opor-se ao tratamento em determinadas circunstâncias</li>
            </ul>
            <p className="mt-3">Para exercer seus direitos, entre em contato: <a href="mailto:privacidade@hubturis.com.br" className="text-blue-600 hover:underline">privacidade@hubturis.com.br</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">8. Segurança dos Dados</h2>
            <p>Adotamos medidas técnicas e organizacionais para proteger seus dados:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Senhas armazenadas com criptografia bcrypt</li>
              <li>Comunicação via HTTPS/TLS</li>
              <li>Banco de dados com acesso restrito e autenticado</li>
              <li>Monitoramento contínuo de segurança</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">9. Cookies</h2>
            <p>Utilizamos cookies essenciais para o funcionamento da plataforma (autenticação e sessão). Não utilizamos cookies de rastreamento de terceiros para publicidade.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">10. Alterações nesta Política</h2>
            <p>Esta política pode ser atualizada periodicamente. Notificaremos os usuários sobre alterações significativas por e-mail ou aviso na plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">11. Contato e Encarregado (DPO)</h2>
            <p>Para questões relacionadas à privacidade e proteção de dados:</p>
            <p className="mt-2"><strong>E-mail:</strong> <a href="mailto:privacidade@hubturis.com.br" className="text-blue-600 hover:underline">privacidade@hubturis.com.br</a></p>
            <p><strong>Autoridade Nacional:</strong> Você pode acionar a ANPD (Autoridade Nacional de Proteção de Dados) em <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.gov.br/anpd</a></p>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex gap-4">
          <Link href="/terms" className="text-blue-600 hover:underline text-sm">Termos de Uso</Link>
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
