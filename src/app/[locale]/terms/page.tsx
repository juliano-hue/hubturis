import Link from 'next/link';

const content = {
  pt: {
    title: 'Termos de Uso',
    updated: 'Última atualização: maio de 2026',
    back: '← Voltar ao início',
    privacy: 'Política de Privacidade',
    sections: [
      { title: '1. Aceitação dos Termos', text: 'Ao acessar ou utilizar a plataforma HubTuris, você concorda com estes Termos de Uso. Se não concordar com qualquer parte, não utilize nossos serviços. Estes termos se aplicam a todos os usuários da plataforma, incluindo consumidores (turistas) e ofertantes (prestadores de serviços turísticos).' },
      { title: '2. Descrição do Serviço', text: 'O HubTuris é uma plataforma digital de intermediação que conecta ofertantes de experiências turísticas a consumidores interessados em contratar tais serviços na região de Natal/RN e arredores. Não somos prestadores diretos das experiências turísticas anunciadas.' },
      { title: '3. Cadastro e Conta', items: ['O usuário deve ter no mínimo 18 anos para se cadastrar.', 'As informações fornecidas no cadastro devem ser verdadeiras e atualizadas.', 'O usuário é responsável pela segurança de sua senha e por todas as atividades realizadas em sua conta.', 'O HubTuris se reserva o direito de suspender ou encerrar contas que violem estes termos.'] },
      { title: '4. Responsabilidades do Ofertante', items: ['O ofertante é responsável pela veracidade das informações divulgadas sobre seus serviços.', 'O ofertante deve possuir todas as licenças e autorizações necessárias para operar.', 'O ofertante é responsável pela execução da experiência turística nos termos anunciados.', 'O HubTuris cobra uma comissão de 10% a 15% sobre o valor de cada reserva realizada.'] },
      { title: '5. Reservas e Pagamentos', items: ['As reservas são confirmadas somente após a confirmação do pagamento.', 'Os pagamentos são processados por gateways de pagamento certificados e seguros.', 'O HubTuris retém a comissão e repassa o valor restante ao ofertante conforme o prazo acordado.', 'Cancelamentos com menos de 24 horas de antecedência não são elegíveis a reembolso.', 'Cancelamentos com 24 horas ou mais de antecedência geram reembolso integral ao consumidor.'] },
      { title: '6. Planos de Visibilidade', text: 'O HubTuris oferece planos pagos de visibilidade (Prata e Ouro) que proporcionam maior destaque na plataforma. Os planos gratuitos (Bronze) garantem presença básica no catálogo.' },
      { title: '7. Avaliações', items: ['Somente consumidores que realizaram a experiência podem avaliar.', 'As avaliações devem ser honestas e não conter conteúdo ofensivo.', 'O HubTuris pode remover avaliações que violem nossas políticas.'] },
      { title: '8. Limitação de Responsabilidade', text: 'O HubTuris atua como intermediador e não se responsabiliza por: acidentes ou incidentes ocorridos durante a realização das experiências; divergências entre o serviço anunciado e o efetivamente prestado; falhas nos serviços por causas de força maior ou caso fortuito.' },
      { title: '9. Propriedade Intelectual', text: 'Todo o conteúdo da plataforma HubTuris — incluindo marca, logotipo, design e código — é protegido por direitos autorais. É vedada a reprodução sem autorização expressa.' },
      { title: '10. Alterações nos Termos', text: 'O HubTuris pode alterar estes termos a qualquer momento. As alterações entram em vigor imediatamente após publicação. O uso continuado da plataforma após as alterações implica aceitação dos novos termos.' },
      { title: '11. Foro e Legislação', text: 'Estes termos são regidos pela legislação brasileira. Fica eleito o foro da Comarca de Natal/RN para dirimir quaisquer controvérsias.' },
      { title: '12. Contato', text: 'Para dúvidas sobre estes termos, entre em contato: contato@hubturis.com.br' },
    ],
  },
  en: {
    title: 'Terms of Use',
    updated: 'Last updated: May 2026',
    back: '← Back to home',
    privacy: 'Privacy Policy',
    sections: [
      { title: '1. Acceptance of Terms', text: 'By accessing or using the HubTuris platform, you agree to these Terms of Use. If you do not agree with any part, do not use our services. These terms apply to all platform users, including consumers (tourists) and providers (tourism service providers).' },
      { title: '2. Service Description', text: 'HubTuris is a digital intermediation platform that connects tourism experience providers with consumers interested in booking such services in the Natal/RN region and surroundings. We are not direct providers of the advertised tourism experiences.' },
      { title: '3. Registration and Account', items: ['Users must be at least 18 years old to register.', 'Information provided during registration must be truthful and up-to-date.', 'Users are responsible for the security of their password and all activities carried out in their account.', 'HubTuris reserves the right to suspend or terminate accounts that violate these terms.'] },
      { title: '4. Provider Responsibilities', items: ['The provider is responsible for the accuracy of information disclosed about their services.', 'The provider must hold all necessary licenses and authorizations to operate.', 'The provider is responsible for executing the tourism experience as advertised.', 'HubTuris charges a commission of 10% to 15% on the value of each booking made.'] },
      { title: '5. Bookings and Payments', items: ['Bookings are confirmed only after payment confirmation.', 'Payments are processed through certified and secure payment gateways.', 'HubTuris retains the commission and transfers the remaining amount to the provider within the agreed timeframe.', 'Cancellations with less than 24 hours notice are not eligible for a refund.', 'Cancellations with 24 hours or more notice result in a full refund to the consumer.'] },
      { title: '6. Visibility Plans', text: 'HubTuris offers paid visibility plans (Silver and Gold) that provide greater prominence on the platform. Free plans (Bronze) guarantee basic presence in the catalog.' },
      { title: '7. Reviews', items: ['Only consumers who have had the experience may leave a review.', 'Reviews must be honest and must not contain offensive content.', 'HubTuris may remove reviews that violate our policies.'] },
      { title: '8. Limitation of Liability', text: 'HubTuris acts as an intermediary and is not responsible for: accidents or incidents occurring during experiences; discrepancies between the advertised service and the service actually provided; service failures due to force majeure or unforeseen events.' },
      { title: '9. Intellectual Property', text: 'All content on the HubTuris platform — including brand, logo, design, and code — is protected by copyright. Reproduction without express authorization is prohibited.' },
      { title: '10. Changes to Terms', text: 'HubTuris may change these terms at any time. Changes take effect immediately upon publication. Continued use of the platform after changes implies acceptance of the new terms.' },
      { title: '11. Jurisdiction and Legislation', text: 'These terms are governed by Brazilian law. The court of the Comarca de Natal/RN is elected to resolve any disputes.' },
      { title: '12. Contact', text: 'For questions about these terms, please contact: contato@hubturis.com.br' },
    ],
  },
  es: {
    title: 'Términos de Uso',
    updated: 'Última actualización: mayo de 2026',
    back: '← Volver al inicio',
    privacy: 'Política de Privacidad',
    sections: [
      { title: '1. Aceptación de los Términos', text: 'Al acceder o utilizar la plataforma HubTuris, usted acepta estos Términos de Uso. Si no está de acuerdo con alguna parte, no utilice nuestros servicios. Estos términos se aplican a todos los usuarios de la plataforma, incluidos consumidores (turistas) y proveedores (prestadores de servicios turísticos).' },
      { title: '2. Descripción del Servicio', text: 'HubTuris es una plataforma digital de intermediación que conecta proveedores de experiencias turísticas con consumidores interesados en contratar dichos servicios en la región de Natal/RN y alrededores. No somos prestadores directos de las experiencias turísticas anunciadas.' },
      { title: '3. Registro y Cuenta', items: ['El usuario debe tener al menos 18 años para registrarse.', 'La información proporcionada durante el registro debe ser verdadera y actualizada.', 'El usuario es responsable de la seguridad de su contraseña y de todas las actividades realizadas en su cuenta.', 'HubTuris se reserva el derecho de suspender o cancelar cuentas que violen estos términos.'] },
      { title: '4. Responsabilidades del Proveedor', items: ['El proveedor es responsable de la veracidad de la información divulgada sobre sus servicios.', 'El proveedor debe poseer todas las licencias y autorizaciones necesarias para operar.', 'El proveedor es responsable de ejecutar la experiencia turística en los términos anunciados.', 'HubTuris cobra una comisión del 10% al 15% sobre el valor de cada reserva realizada.'] },
      { title: '5. Reservas y Pagos', items: ['Las reservas se confirman solo tras la confirmación del pago.', 'Los pagos se procesan a través de pasarelas de pago certificadas y seguras.', 'HubTuris retiene la comisión y transfiere el valor restante al proveedor en el plazo acordado.', 'Las cancelaciones con menos de 24 horas de antelación no son elegibles para reembolso.', 'Las cancelaciones con 24 horas o más de antelación generan un reembolso completo al consumidor.'] },
      { title: '6. Planes de Visibilidad', text: 'HubTuris ofrece planes de visibilidad de pago (Plata y Oro) que proporcionan mayor relevancia en la plataforma. Los planes gratuitos (Bronce) garantizan presencia básica en el catálogo.' },
      { title: '7. Reseñas', items: ['Solo los consumidores que hayan realizado la experiencia pueden dejar una reseña.', 'Las reseñas deben ser honestas y no contener contenido ofensivo.', 'HubTuris puede eliminar reseñas que violen nuestras políticas.'] },
      { title: '8. Limitación de Responsabilidad', text: 'HubTuris actúa como intermediario y no se responsabiliza por: accidentes o incidentes ocurridos durante las experiencias; discrepancias entre el servicio anunciado y el efectivamente prestado; fallos en los servicios por causas de fuerza mayor o caso fortuito.' },
      { title: '9. Propiedad Intelectual', text: 'Todo el contenido de la plataforma HubTuris — incluida la marca, el logotipo, el diseño y el código — está protegido por derechos de autor. Se prohíbe la reproducción sin autorización expresa.' },
      { title: '10. Cambios en los Términos', text: 'HubTuris puede modificar estos términos en cualquier momento. Los cambios entran en vigor inmediatamente tras su publicación. El uso continuado de la plataforma tras los cambios implica la aceptación de los nuevos términos.' },
      { title: '11. Jurisdicción y Legislación', text: 'Estos términos se rigen por la legislación brasileña. Se elige el tribunal de la Comarca de Natal/RN para resolver cualquier controversia.' },
      { title: '12. Contacto', text: 'Para consultas sobre estos términos, póngase en contacto con: contato@hubturis.com.br' },
    ],
  },
} as const;

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
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
          <Link href={`/${locale}/privacy`} className="text-blue-600 hover:underline text-sm">{c.privacy}</Link>
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">{c.back}</Link>
        </div>
      </div>
    </div>
  );
}
