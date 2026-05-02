'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

interface ConsumerProfile {
  fullName: string;
  cpf: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  paymentType: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardBrand?: string;
}

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

  const [formData, setFormData] = useState<ConsumerProfile>({
    fullName: '',
    cpf: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    paymentType: 'credit_card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardBrand: 'visa',
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');

    if (!storedUserId || role !== 'CONSUMER') {
      router.push(`/${locale}/login`);
      return;
    }

    setUserId(storedUserId);

    if (userName) {
      setFormData(prev => ({ ...prev, fullName: userName }));
    }

    fetch(`/api/consumer/profile?userId=${storedUserId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setFormData({
            fullName: data.fullName || userName || '',
            cpf: data.cpf || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            paymentType: data.paymentType || 'credit_card',
            cardNumber: data.cardNumber || '',
            cardExpiry: data.cardExpiry || '',
            cardCvv: data.cardCvv || '',
            cardBrand: data.cardBrand || 'visa',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router, locale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!userId) {
      router.push(`/${locale}/login`);
      return;
    }

    try {
      const response = await fetch('/api/consumer/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errorMessage'));
      }

      setSuccess(t('successMessage'));
      setIsEditing(false);
      
      if (formData.fullName) {
        localStorage.setItem('userName', formData.fullName);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const estados = ['AC', 'AL', 'AP', 'AM', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{common('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <Link href={`/${locale}/consumer`} className="text-blue-600 hover:text-blue-800 text-sm">
            ← {t('backToDashboard')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{t('title')}</h1>
          <p className="text-gray-600 text-sm mt-1">{t('subtitle')}</p>
        </div>

        {!isEditing ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('personalInfo')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-gray-500">{t('fullName')}</label><p className="font-medium">{formData.fullName || '-'}</p></div>
                  <div><label className="text-sm text-gray-500">{t('cpf')}</label><p className="font-medium">{formData.cpf || '-'}</p></div>
                  <div><label className="text-sm text-gray-500">{t('phone')}</label><p className="font-medium">{formData.phone || '-'}</p></div>
                  <div><label className="text-sm text-gray-500">{t('address')}</label><p className="font-medium">{formData.address || '-'}</p></div>
                  <div><label className="text-sm text-gray-500">{t('city')}</label><p className="font-medium">{formData.city || '-'}</p></div>
                  <div><label className="text-sm text-gray-500">{t('state')}</label><p className="font-medium">{formData.state || '-'}</p></div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('paymentInfo')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-sm text-gray-500">{t('paymentType')}</label><p className="font-medium">{formData.paymentType === 'credit_card' ? 'Cartão de Crédito' : formData.paymentType}</p></div>
                  {formData.paymentType === 'credit_card' && (
                    <>
                      <div><label className="text-sm text-gray-500">{t('cardNumber')}</label><p className="font-medium">{formData.cardNumber ? `**** **** **** ${formData.cardNumber.slice(-4)}` : '-'}</p></div>
                      <div><label className="text-sm text-gray-500">{t('cardExpiry')}</label><p className="font-medium">{formData.cardExpiry || '-'}</p></div>
                      <div><label className="text-sm text-gray-500">{t('cardBrand')}</label><p className="font-medium">{formData.cardBrand || '-'}</p></div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                {t('editButton')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <h3 className="text-lg font-semibold mb-4">{t('personalInfo')}</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')} *</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('cpf')} *</label>
              <input type="text" name="cpf" required value={formData.cpf} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')} *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')} *</label>
              <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('city')} *</label>
                <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('state')} *</label>
                <select name="state" required value={formData.state} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base bg-white">
                  <option value="">{t('state')}</option>
                  {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4 mt-4">{t('paymentInfo')}</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('paymentType')} *</label>
              <select name="paymentType" value={formData.paymentType} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base bg-white">
                <option value="credit_card">{t('creditCard') || 'Cartão de Crédito'}</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>

            {formData.paymentType === 'credit_card' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('cardNumber')}</label>
                  <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('cardExpiry')}</label>
                    <input type="text" name="cardExpiry" value={formData.cardExpiry} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input type="text" name="cardCvv" value={formData.cardCvv} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('cardBrand')}</label>
                  <select name="cardBrand" value={formData.cardBrand} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base bg-white">
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="elo">Elo</option>
                    <option value="hipercard">Hipercard</option>
                    <option value="amex">Amex</option>
                  </select>
                </div>
              </>
            )}

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
            {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition disabled:opacity-50 text-base">
                {saving ? t('saving') || 'Salvando...' : t('saveButton')}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition">
                {t('cancelButton')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}