'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

// Carrega o calendário apenas no cliente
const Calendar = lazy(() => import('react-calendar').then(mod => ({ default: mod.default })));

import 'react-calendar/dist/Calendar.css';

interface ProviderData {
  id: string;
  fullName: string;
  cpf: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bankName: string;
  agency: string;
  accountNumber: string;
  accountType: string;
  pixKey: string;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function NewAttractionPage() {
  const params = useParams();
  const locale = params?.locale || 'pt';
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    state: '',
    price: '',
    pricingType: 'PER_PERSON',
    duration: '',
    maxCapacity: '',
    category: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calendário
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dateRange, setDateRange] = useState<Value>([new Date(), new Date()]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [pricePerDate, setPricePerDate] = useState<{ [key: string]: number }>({});
  const [availableSlots, setAvailableSlots] = useState<{ [key: string]: number }>({});

  const estados = ['AC', 'AL', 'AP', 'AM', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  // ========== FUNÇÕES DO CALENDÁRIO ==========
  const onDateChange = (value: Value) => {
    setDateRange(value);
    if (value instanceof Date) {
      if (!selectedDates.find(d => d.toDateString() === value.toDateString())) {
        setSelectedDates([...selectedDates, value]);
        setPricePerDate({ ...pricePerDate, [value.toISOString()]: parseFloat(formData.price) || 0 });
        setAvailableSlots({ ...availableSlots, [value.toISOString()]: parseInt(formData.maxCapacity) || 10 });
      }
    } else if (Array.isArray(value) && value[0] && value[1]) {
      const start = value[0];
      const end = value[1];
      const dates: Date[] = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        if (!selectedDates.find(d => d.toDateString() === currentDate.toDateString())) {
          dates.push(new Date(currentDate));
          setPricePerDate(prev => ({ ...prev, [currentDate.toISOString()]: parseFloat(formData.price) || 0 }));
          setAvailableSlots(prev => ({ ...prev, [currentDate.toISOString()]: parseInt(formData.maxCapacity) || 10 }));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setSelectedDates([...selectedDates, ...dates]);
    }
    setShowCalendar(false);
  };

  const removeDate = (dateToRemove: Date) => {
    setSelectedDates(selectedDates.filter(d => d.toDateString() !== dateToRemove.toDateString()));
    const newPricePerDate = { ...pricePerDate };
    delete newPricePerDate[dateToRemove.toISOString()];
    setPricePerDate(newPricePerDate);
    const newAvailableSlots = { ...availableSlots };
    delete newAvailableSlots[dateToRemove.toISOString()];
    setAvailableSlots(newAvailableSlots);
  };

  const updateDatePrice = (date: Date, newPrice: number) => {
    setPricePerDate({ ...pricePerDate, [date.toISOString()]: newPrice });
  };

  const updateDateSlots = (date: Date, newSlots: number) => {
    setAvailableSlots({ ...availableSlots, [date.toISOString()]: newSlots });
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    if (validFiles.length !== fileArray.length) setError('Apenas imagens e vídeos são permitidos');
    if (validFiles.length + images.length > 20) {
      setError('Máximo de 20 arquivos permitidos');
      return;
    }
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setError('');
  };

  const handleImageClick = () => fileInputRef.current?.click();
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
  };
  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };
  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of images) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      } catch (error) { console.error(error); }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) { router.push(`/${locale}/login`); return; }
      const attractionResponse = await fetch('/api/provider/attractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration: formData.duration ? parseInt(formData.duration) : null,
          maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
          providerId: userId,
        }),
      });
      const attractionData = await attractionResponse.json();
      if (!attractionResponse.ok) throw new Error(attractionData.error || 'Erro ao criar atração');
      const attractionId = attractionData.id;
      if (images.length > 0) {
        const uploadedUrls = await uploadImages();
        if (uploadedUrls.length > 0) {
          await fetch(`/api/provider/attractions/${attractionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: uploadedUrls }),
          });
        }
      }
      const availabilityData = selectedDates.map(date => ({
        attractionId,
        date: date.toISOString(),
        price: pricePerDate[date.toISOString()] || parseFloat(formData.price) || 0,
        maxParticipants: availableSlots[date.toISOString()] || parseInt(formData.maxCapacity) || 10,
      }));
      if (availabilityData.length > 0) {
        await fetch('/api/provider/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ availabilities: availabilityData }),
        });
      }
      router.push(`/${locale}/provider/my-attractions`);
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'Erro ao cadastrar atração');
    } finally { setLoading(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const fetchProvider = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) { router.push(`/${locale}/login`); return; }
        const response = await fetch(`/api/provider/profile?userId=${userId}`);
        const data = await response.json();
        if (response.ok) setProvider(data);
        else router.push(`/${locale}/provider/profile`);
      } catch (error) { router.push(`/${locale}/provider/profile`); }
    };
    fetchProvider();
  }, [isClient, router, locale]);

  if (!isClient || !provider) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="mb-4 sm:mb-8">
          <Link href={`/${locale}/provider/my-attractions`} className="text-blue-600 hover:text-blue-700 inline-block text-sm sm:text-base">
            ← Voltar para minhas atrações
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">Cadastrar Nova Atração</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">Preencha os dados da sua experiência turística</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título da Atração *</label>
            <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-base" />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Completa *</label>
            <textarea name="description" required rows={5} value={formData.description} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-base" />
          </div>

          {/* Localização e Cidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localização *</label>
              <input type="text" name="location" required value={formData.location} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
              <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-base" />
            </div>
          </div>

          {/* Estado e Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select name="state" required value={formData.state} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-base">
                <option value="">Selecione</option>
                {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-base">
                <option value="">Selecione</option>
                <option value="Aventura">🏄 Aventura</option>
                <option value="Cultural">🏛️ Cultural</option>
                <option value="Ecoturismo">🌿 Ecoturismo</option>
                <option value="Praia">🏖️ Praia</option>
                <option value="Gastronomia">🍽️ Gastronomia</option>
                <option value="City Tour">🏙️ City Tour</option>
              </select>
            </div>
          </div>

          {/* Preço e tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Precificação *</label>
              <select name="pricingType" value={formData.pricingType} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-base">
                <option value="PER_PERSON">Por Pessoa</option>
                <option value="FLAT_RATE">Preço Fechado (por grupo)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
              <input type="number" name="price" required step="0.01" min="0" value={formData.price} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-base" />
            </div>
          </div>

          {/* Duração e Capacidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração (horas)</label>
              <input type="number" name="duration" step="0.5" min="0" value={formData.duration} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade Máxima</label>
              <input type="number" name="maxCapacity" min="1" value={formData.maxCapacity} onChange={handleInputChange} className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-base" />
            </div>
          </div>

          {/* CALENDÁRIO - Com ClientOnly */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">📅 Datas de Disponibilidade</label>
            <button type="button" onClick={() => setShowCalendar(!showCalendar)} className="mb-3 sm:mb-4 inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base min-h-[40px]">
              {showCalendar ? 'Fechar Calendário' : '➕ Adicionar Datas'}
            </button>
            {showCalendar && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50 overflow-x-auto">
                <ClientOnly>
                  <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
                    <Calendar onChange={onDateChange} value={dateRange} selectRange={true} className="w-full border-0" />
                  </Suspense>
                </ClientOnly>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Clique em uma data para selecionar um dia, ou arraste para selecionar um intervalo.</p>
              </div>
            )}
            {selectedDates.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm sm:text-md font-medium text-gray-700 mb-2 sm:mb-3">Datas Disponíveis: ({selectedDates.length})</h4>
                <div className="space-y-2 sm:space-y-3 max-h-60 overflow-y-auto">
                  {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((date, index) => (
                    <div key={index} className="flex flex-wrap items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-[100px]"><span className="font-medium text-sm sm:text-base">{date.toLocaleDateString('pt-BR')}</span></div>
                      <div className="flex flex-wrap items-center gap-2">
                        <input type="number" value={pricePerDate[date.toISOString()] || formData.price} onChange={(e) => updateDatePrice(date, parseFloat(e.target.value))} step="0.01" className="w-24 sm:w-28 px-2 py-1 border rounded text-sm" placeholder="Preço" />
                        <input type="number" value={availableSlots[date.toISOString()] || formData.maxCapacity || 10} onChange={(e) => updateDateSlots(date, parseInt(e.target.value))} min="1" className="w-16 sm:w-20 px-2 py-1 border rounded text-sm" placeholder="Vagas" />
                        <button type="button" onClick={() => removeDate(date)} className="text-red-500 hover:text-red-700 text-base sm:text-sm px-2 min-w-[32px]">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* UPLOAD */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">📸 Fotos e Vídeos (máximo 20)</label>
            <input type="file" ref={fileInputRef} multiple accept="image/*,video/*" onChange={handleImageChange} className="hidden" />
            <div onClick={handleImageClick} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop} className={`flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}`}>
              <div className="text-center">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="text-xs sm:text-sm text-gray-600 mt-1"><span className="font-medium text-blue-600">Clique para selecionar</span> ou arraste e solte</div>
                <p className="text-xs text-gray-500 mt-1">Imagens: JPG, PNG, WEBP (até 10MB) | Vídeos: MP4, WEBM (até 100MB)</p>
              </div>
            </div>
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    {images[index]?.type.startsWith('video/') ? 
                      <video src={preview} className="w-full h-28 sm:h-32 object-cover rounded-lg" controls /> : 
                      <img src={preview} alt="Preview" className="w-full h-28 sm:h-32 object-cover rounded-lg" />
                    }
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 w-5 h-5 sm:w-6 sm:h-6 opacity-0 group-hover:opacity-100 hover:bg-red-700 text-xs sm:text-base">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg disabled:opacity-50 text-sm sm:text-base min-h-[44px]">
            {loading ? 'Cadastrando...' : 'Cadastrar Atração'}
          </button>
        </form>
      </div>
    </div>
  );
}