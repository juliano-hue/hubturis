'use client';

interface PaymentMethod {
  id: string;
  name: string;
  provider: 'stripe' | 'mercadopago';
  icon: string;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'stripe',
    name: 'Cartão Internacional',
    provider: 'stripe',
    icon: '💳',
    description: 'Visa, Mastercard, Amex, Elo'
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    provider: 'mercadopago',
    icon: '🇧🇷',
    description: 'PIX, Boleto, Cartão Nacional'
  }
];

interface PaymentSelectorProps {
  selectedProvider: string;
  onSelect: (provider: string) => void;
}

export default function PaymentSelector({ selectedProvider, onSelect }: PaymentSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.provider)}
            className={`p-4 border-2 rounded-xl text-left transition-all ${
              selectedProvider === method.provider
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{method.icon}</span>
              <div>
                <div className="font-semibold">{method.name}</div>
                <div className="text-xs text-gray-500">{method.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}