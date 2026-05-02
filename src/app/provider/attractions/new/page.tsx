'use client';

export const dynamic = 'force-dynamic';   // ← ESSA LINHA RESOLVE O ERRO DE PRERENDER

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamicNoSSR from 'next/dynamic';

const Calendar = dynamicNoSSR(() => import('react-calendar').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

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

  // ========== FUNÇÕES ==========
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
      if (!userId) { router.push('/login'); return; }
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
      router.push('/provider/my-attractions');
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'Erro ao cadastrar atração');
    } finally { setLoading(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ========== CLIENT-SIDE ONLY ==========
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carregar dados do provedor (só no cliente)
  useEffect(() => {
    if (!isClient) return;
    const fetchProvider = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) { router.push('/login'); return; }
        const response = await fetch(`/api/provider/profile?userId=${userId}`);
        const data = await response.json();
        if (response.ok) setProvider(data);
        else router.push('/provider/profile');
      } catch (error) { router.push('/provider/profile'); }
    };
    fetchProvider();
  }, [isClient, router]);

  // Se não está no cliente, retorna loading vazio (evita pré-renderização)
  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!provider) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="mb-4 sm:mb-8">
          <Link href="/provider/my-attractions" className="text-blue-600 hover:text-blue-700 inline-block text-sm sm:text-base">
            ← Voltar para minhas atrações
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">Cadastrar Nova Atração</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">Preencha os dados da sua experiência turística</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* ... todo o resto do seu formulário permanece igual (Título, Descrição, etc.) ... */}
          {/* O calendário e o resto do JSX que você já tinha */}
        </form>
      </div>
    </div>
  );
}