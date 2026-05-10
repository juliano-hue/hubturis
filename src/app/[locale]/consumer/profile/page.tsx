'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

const maskCPF    = (v: string) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
const maskPhone  = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 11); if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim(); return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim(); };
const maskExpiry = (v: string) => v.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2');
const maskLastFour = (v: string) => v.replace(/\D/g, '').slice(0, 4);

const MASKS: Record<string, (v: string) => string> = {
  cpf: maskCPF,
  phone: maskPhone,
  cardLastFour: maskLastFour,
  cardExpiry: maskExpiry,
};

const ESTADOS = ['AC','AL','AP','AM','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

interface ConsumerProfile {
  fullName: string; cpf: string; phone: string; address: string;
  city: string; state: string; paymentType: string;
  cardLastFour: string; cardExpiry: string; cardBrand: string;
}

const empty: ConsumerProfile = {
  fullName: '', cpf: '', phone: '', address: '', city: '', state: '',
  paymentType: 'PIX', cardLastFour: '', cardExpiry: '', cardBrand: 'visa',
};

export default function ConsumerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'pt';
  const t = useTranslations('profile');
  const common = useTranslations('common');

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ConsumerProfile>(empty);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    if (!id || role !== 'CONSUMER') { router.push(`/${locale}/login`); return; }
    setUserId(id);
    if (name) setFormData(prev => ({ ...prev, fullName: name }));

    fetch(`/api/consumer/profile?userId=${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setFormData({
            fullName: data.fullName || name || '',
            cpf: maskCPF(data.cpf || ''),
            phone: maskPhone(data.phone || ''),
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            paymentType: data.paymentType || 'PIX',
            cardLastFour: data.cardLastFour || '',
            cardExpiry: maskExpiry(data.cardExpiry || ''),
            cardBrand: data.cardBrand || 'visa',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router, locale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const masked = MASKS[name] ? MASKS[name](value) : value;
    setFormData(prev => ({ ...prev, [name]: masked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    if (!userId) { router.push(`/${locale}/login`); return; }
    try {
      const res = await fetch('/api/consumer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('errorMessage'));
      setSuccess(t('successMessage'));
      setIsEditing(false);
      if (formData.fullName) localStorage.setItem('userName', formData.fullName);
    } catch (err: any) {
      setError(err.message);
    } finally { setSaving(false); }
  };

  const paymentLabel = (v: string) => ({ credit_card: 'Cartão de Crédito', PIX: 'PIX', pix: 'PIX', boleto: 'Boleto' }[v] || v);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">{common('loading')}</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-3xl mx-auto">

        <button
          type="button"
          onClick={() => router.push(`/${locale}/consumer`)}
          className="w-full py-4 mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white text-base font-bold rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
        >
          ← {t('backToDashboard')}
        </button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('subtitle')}</p>
        </div>

        {!isEditing ? (
          /* ====== VISUALIZAÇÃO ====== */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('personalInfo')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  [t('fullName'), formData.fullName],
                  [t('cpf'), formData.cpf],
                  [t('phone'), formData.phone],
                  [t('address'), formData.address],
                  [t('city'), formData.city],
                  [t('state'), formData.state],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="font-medium text-gray-900">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('paymentInfo')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('paymentType')}</p>
                  <p className="font-medium text-gray-900">{paymentLabel(formData.paymentType)}</p>
                </div>
                {formData.paymentType === 'credit_card' && formData.cardLastFour && (
                  <>
                    <div><p className="text-sm text-gray-500">{t('cardNumber')}</p><p className="font-medium">**** **** **** {formData.cardLastFour}</p></div>
                    <div><p className="text-sm text-gray-500">{t('cardExpiry')}</p><p className="font-medium">{formData.cardExpiry || '—'}</p></div>
                    <div><p className="text-sm text-gray-500">{t('cardBrand')}</p><p className="font-medium capitalize">{formData.cardBrand || '—'}</p></div>
                  </>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t">
              <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition">
                ✏️ {t('editButton')}
              </button>
            </div>
          </div>
        ) : (
          /* ====== FORMULÁRIO ====== */
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-5">

            <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b">👤 {t('personalInfo')}</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')} *</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-base" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('cpf')} *</label>
                <input type="text" name="cpf" required value={formData.cpf} onChange={handleChange}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')} *</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-base" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')} *</label>
              <input type="text" name="address" required value={formData.address} onChange={handleChange}
                placeholder="Rua, número, complemento"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-base" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('city')} *</label>
                <input type="text" name="city" required value={formData.city} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('state')} *</label>
                <select name="state" required value={formData.state} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-base bg-white">
                  <option value="">Selecione</option>
                  {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b pt-2">💳 {t('paymentInfo')}</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('paymentType')} *</label>
              <select name="paymentType" value={formData.paymentType} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-base bg-white">
                <option value="PIX">PIX</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>

            {formData.paymentType === 'credit_card' && (
              <>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                  🔒 Os dados completos do cartão serão inseridos no momento do pagamento, diretamente no gateway seguro. Aqui você pode salvar apenas os últimos 4 dígitos para identificação.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Últimos 4 dígitos</label>
                    <input type="text" name="cardLastFour" value={formData.cardLastFour} onChange={handleChange}
                      placeholder="0000" maxLength={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-base font-mono text-center" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('cardExpiry')}</label>
                    <input type="text" name="cardExpiry" value={formData.cardExpiry} onChange={handleChange}
                      placeholder="MM/AA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-base text-center" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('cardBrand')}</label>
                    <select name="cardBrand" value={formData.cardBrand} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-base bg-white">
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="elo">Elo</option>
                      <option value="hipercard">Hipercard</option>
                      <option value="amex">Amex</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
            {success && <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition text-base">
                {saving ? t('saving') : t('saveButton')}
              </button>
              <button type="button" onClick={() => setIsEditing(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition">
                {t('cancelButton')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
