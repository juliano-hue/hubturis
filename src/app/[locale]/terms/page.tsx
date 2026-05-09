import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">← Voltar ao início</Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
        <p className="text-gray-500 text-sm mb-8">Última atualização: maio de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. Aceitação dos Termos</h2>
            <p>Ao acessar ou utilizar a plataforma HubTuris, você concorda com estes Termos de Uso. Se não concordar com qualquer parte, não utilize nossos serviços. Estes termos se aplicam a todos os usuários da plataforma, incluindo consumidores (turistas) e ofertantes (prestadores de serviços turísticos).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. Descrição do Serviço</h2>
            <p>O HubTuris é uma plataforma digital de intermediação que conecta ofertantes de experiências turísticas a consumidores interessados em contratar tais serviços na região de Natal/RN e arredores. Não somos prestadores diretos das experiências turísticas anunciadas.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">3. Cadastro e Conta</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>O usuário deve ter no mínimo 18 anos para se cadastrar.</li>
              <li>As informações fornecidas no cadastro devem ser verdadeiras e atualizadas.</li>
              <li>O usuário é responsável pela segurança de sua senha e por todas as atividades realizadas em sua conta.</li>
              <li>O HubTuris se reserva o direito de suspender ou encerrar contas que violem estes termos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. Responsabilidades do Ofertante</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>O ofertante é responsável pela veracidade das informações divulgadas sobre seus serviços.</li>
              <li>O ofertante deve possuir todas as licenças e autorizações necessárias para operar.</li>
              <li>O ofertante é responsável pela execução da experiência turística nos termos anunciados.</li>
              <li>O HubTuris cobra uma comissão de 10% a 15% sobre o valor de cada reserva realizada.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">5. Reservas e Pagamentos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>As reservas são confirmadas somente após a confirmação do pagamento.</li>
              <li>Os pagamentos são processados por gateways de pagamento certificados e seguros.</li>
              <li>O HubTuris retém a comissão e repassa o valor restante ao ofertante conforme o prazo acordado.</li>
              <li>Cancelamentos com menos de 24 horas de antecedência não são elegíveis a reembolso.</li>
              <li>Cancelamentos com 24 horas ou mais de antecedência geram reembolso integral ao consumidor.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">6. Planos de Visibilidade</h2>
            <p>O HubTuris oferece planos pagos de visibilidade (Prata e Ouro) que proporcionam maior destaque na plataforma. Os planos gratuitos (Bronze) garantem presença básica no catálogo. Os valores e benefícios de cada plano estão disponíveis na página de planos da plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">7. Avaliações</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Somente consumidores que realizaram a experiência podem avaliar.</li>
              <li>As avaliações devem ser honestas e não conter conteúdo ofensivo.</li>
              <li>O HubTuris pode remover avaliações que violem nossas políticas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">8. Limitação de Responsabilidade</h2>
            <p>O HubTuris atua como intermediador e não se responsabiliza por:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acidentes ou incidentes ocorridos durante a realização das experiências.</li>
              <li>Divergências entre o serviço anunciado e o efetivamente prestado pelo ofertante.</li>
              <li>Falhas nos serviços por causas de força maior ou caso fortuito.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">9. Propriedade Intelectual</h2>
            <p>Todo o conteúdo da plataforma HubTuris — incluindo marca, logotipo, design e código — é protegido por direitos autorais. É vedada a reprodução sem autorização expressa.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">10. Alterações nos Termos</h2>
            <p>O HubTuris pode alterar estes termos a qualquer momento. As alterações entram em vigor imediatamente após publicação. O uso continuado da plataforma após as alterações implica aceitação dos novos termos.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">11. Foro e Legislação</h2>
            <p>Estes termos são regidos pela legislação brasileira. Fica eleito o foro da Comarca de Natal/RN para dirimir quaisquer controvérsias.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">12. Contato</h2>
            <p>Para dúvidas sobre estes termos, entre em contato: <a href="mailto:contato@hubturis.com.br" className="text-blue-600 hover:underline">contato@hubturis.com.br</a></p>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex gap-4">
          <Link href="/privacy" className="text-blue-600 hover:underline text-sm">Política de Privacidade</Link>
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
