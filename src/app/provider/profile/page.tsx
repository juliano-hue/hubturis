'use client';
//export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Imagens disponíveis na pasta atracoes-natal
const imagensDisponiveis = [
  '/atracoes-natal/Flow,_gere_para_202sss604211745.jpg',
  '/atracoes-natal/Flow,_gere_para_sss202fgdsssddszcs604211745.jpg',
  '/atracoes-natal/Flow,_gere_para_sss202fgdssss604211745.jpg',
  '/atracoes-natal/Flow,_gere_para_sss202sss604211745.jpg',
  '/atracoes-natal/Fotos_asdatraaasções_turismoasdaDF_202604211744.jpg',
  '/atracoes-natal/Fotos_asdatraaasções_turismo_202604211744.jpg',
  '/atracoes-natal/Fotos_asdatraaasções_turisSDFASmoasdaDF_202604211744.jpg',
  '/atracoes-natal/Fotos_asdatrações_turismo_202604211744.jpg',
  '/atracoes-natal/Fotos_atrações_turismo_202604211744 (1).jpeg',
  '/atracoes-natal/Fotos_atrações_turismo_202604211745.jpeg',
  '/atracoes-natal/Gere_imagens_turísticas_202604211742.jpeg',
  '/atracoes-natal/Gere_imagens_turísticas_202604211743 (1).jpeg',
  '/atracoes-natal/Gere_imagens_turísticas_202604211743.jpeg',
  '/atracoes-natal/Mitsubishi_Pajero_dune_202604211712.jpeg',
];

export default function ProviderProfilePage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [fundoIndex, setFundoIndex] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bankName: '',
    agency: '',
    accountNumber: '',
    accountType: 'CORRENTE',
    pixKey: '',
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mudar imagem de fundo a cada 10 segundos
  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      setFundoIndex((prev) => (prev + 1) % imagensDisponiveis.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isClient]);

  const estados = [
    { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
    { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
    { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' }, { uf: 'GO', nome: 'Goiás' },
    { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' }, { uf: 'MS', nome: 'Mato Grosso do Sul' },
    { uf: 'MG', nome: 'Minas Gerais' }, { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' },
    { uf: 'PR', nome: 'Paraná' }, { uf: 'PE', nome: 'Pernambuco' }, { uf: 'P I', nome: 'Piauí' },
    { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' }, { uf: 'RS', nome: 'Rio Grande do Sul' },
    { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
    { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' },
  ];

  const applyCPFMask = (value: string) => value.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2').slice(0,14);
  const applyPhoneMask = (value: string) => value.replace(/\D/g,'').replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2').slice(0,15);
  const applyCEPMask = (value: string) => value.replace(/\D/g,'').replace(/(\d{5})(\d)/,'$1-$2').slice(0,9);

  useEffect(() => {
    if (!isClient) return;
    const id = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    if (!id || role !== 'PROVIDER') {
      router.push('/login');
      return;
    }
    setUserId(id);
    fetch(`/api/provider/profile?userId=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.profile && Object.keys(data.profile).length > 0 && data.profile.fullName) {
          setFormData({
            fullName: data.profile.fullName || '',
            cpf: data.profile.cpf || '',
            phone: data.profile.phone || '',
            address: data.profile.address || '',
            city: data.profile.city || '',
            state: data.profile.state || '',
            zipCode: data.profile.zipCode || '',
            bankName: data.profile.bankName || '',
            agency: data.profile.agency || '',
            accountNumber: data.profile.accountNumber || '',
            accountType: data.profile.accountType || 'CORRENTE',
            pixKey: data.profile.pixKey || '',
          });
          setIsEditing(false);
          setIsNewUser(false);
        } else {
          setIsEditing(true);
          setIsNewUser(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setIsEditing(true);
        setIsNewUser(true);
        setLoading(false);
      });
  }, [isClient, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;
    if (name === 'cpf') maskedValue = applyCPFMask(value);
    if (name === 'phone') maskedValue = applyPhoneMask(value);
    if (name === 'zipCode') maskedValue = applyCEPMask(value);
    setFormData(prev => ({ ...prev, [name]: maskedValue }));
  };

    const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/provider/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao salvar');
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
      setIsNewUser(false);
      
      if (isNewUser) {
        setTimeout(() => {
          router.push('/provider/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const clearCookies = () => {
    document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  };

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      localStorage.clear();
      clearCookies();
      window.location.href = '/';
    }
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl sm:text-7xl mb-4 sm:mb-6 animate-bounce">🏖️</div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-base sm:text-xl text-gray-600 font-medium">Carregando seu perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* HERO SECTION - RESPONSIVO */}
      <div 
        className="relative h-[30vh] sm:h-[40vh] min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center text-white bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${imagensDisponiveis[fundoIndex]}')` }}
      >
        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4">
            {isNewUser ? 'Complete seu Cadastro' : 'Meu Perfil'}
          </h1>
          <p className="text-sm sm:text-xl text-gray-200 px-2">
            {isNewUser 
              ? 'Preencha seus dados para começar a oferecer experiências' 
              : 'Gerencie suas informações e atrações'}
          </p>
        </div>
      </div>

      {/* NAVEGAÇÃO - Apenas para usuários existentes (RESPONSIVO) */}
      {!isEditing && !isNewUser && (
        <div className="relative py-3 sm:py-4 bg-white/80 backdrop-blur-sm border-b overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-center gap-2 sm:gap-4 flex-wrap">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full font-medium transition shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-base min-h-[40px]"
            >
              ✏️ Editar Perfil
            </button>
            <button
              onClick={() => router.push('/provider/my-attractions')}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full font-medium transition shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-base min-h-[40px]"
            >
              📋 Minhas Atrações
            </button>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full font-medium transition shadow-md hover:shadow-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-base min-h-[40px]"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      )}

      {/* FORMULÁRIO - RESPONSIVO */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 sm:px-8 py-4 sm:py-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              {isNewUser ? 'Informações do Ofertante' : 'Informações do Ofertante'}
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm mt-1">
              {isNewUser ? 'Preencha todos os campos para continuar' : 'Atualize seus dados pessoais e bancários'}
            </p>
          </div>

          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">👤 Dados Pessoais</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing && !isNewUser} className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} disabled={!isEditing && !isNewUser} className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-base" maxLength={14} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">📍 Endereço e Contato</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={!isEditing && !isNewUser} className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl disabled:bg-gray-100 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} disabled={!isEditing && !isNewUser} className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl disabled:bg-gray-100 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                  <select name="state" value={formData.state} onChange={handleChange} disabled={!isEditing && !isNewUser} className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl disabled:bg-gray-100 text-base">
                    <option value="">Selecione</option>
                    {estados.map(est => <option key={est.uf} value={est.uf}>{est.uf} - {est.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} disabled={!isEditing && !isNewUser} className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl disabled:bg-gray-100 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing && !isNewUser} className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl disabled:bg-gray-100 text-base" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">🏦 Dados Bancários</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banco *</label>
                  <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} disabled={!isEditing && !isNewUser} className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl disabled:bg-gray-100 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agência *</label>
                  <input type="text" name="agency" value={formData.agency} onChange={handleChange} disabled={!isEditing && !isNewUser} className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl disabled:bg-gray-100 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número da Conta *</label>
                  <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} disabled={!isEditing && !isNewUser} className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl disabled:bg-gray-100 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta *</label>
                  <select name="accountType" value={formData.accountType} onChange={handleChange} disabled={!isEditing && !isNewUser} className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl disabled:bg-gray-100 text-base">
                    <option value="CORRENTE">Conta Corrente</option>
                    <option value="POUPANCA">Conta Poupança</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX *</label>
                  <input type="text" name="pixKey" value={formData.pixKey} onChange={handleChange} disabled={!isEditing && !isNewUser} className="w-full px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl disabled:bg-gray-100 text-base" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTÃO SALVAR - RESPONSIVO */}
        {(isEditing || isNewUser) && (
          <div className="mt-6 sm:mt-8 flex justify-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl transition shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 min-h-[44px]"
            >
              {saving ? 'Salvando...' : '💾 Salvar Informações'}
            </button>
          </div>
        )}

        {success && <p className="text-green-600 text-center mt-4 sm:mt-6 font-medium bg-green-50 p-2 sm:p-3 rounded-lg sm:rounded-xl text-sm sm:text-base">{success}</p>}
        {error && <p className="text-red-600 text-center mt-4 sm:mt-6 font-medium bg-red-50 p-2 sm:p-3 rounded-lg sm:rounded-xl text-sm sm:text-base">{error}</p>}
      </div>

      {/* FOOTER - CORRIGIDO */}
      <footer className="bg-gray-900 text-gray-400 py-4 sm:py-6 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm">© 2026 HubTuris. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}