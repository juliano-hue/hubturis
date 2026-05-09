'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Props {
  attractionId?: string; // se não informado = nova atração
}

const ESTADOS = ['AC','AL','AP','AM','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const today = new Date().toISOString().split('T')[0];

export default function AttractionFormContent({ attractionId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!attractionId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '', description: '', location: '', city: '', state: '',
    price: '', pricingType: 'PER_PERSON', duration: '', maxCapacity: '', category: '',
  });

  // Imagens
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Datas — sem react-calendar
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [pricePerDate, setPricePerDate] = useState<Record<string, number>>({});
  const [availableSlots, setAvailableSlots] = useState<Record<string, number>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Carrega dados existentes no modo edição
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const [attrRes, availRes] = await Promise.all([
          fetch(`/api/provider/attractions/${attractionId}`),
          fetch(`/api/provider/availabilities?attractionId=${attractionId}`),
        ]);
        if (attrRes.ok) {
          const data = await attrRes.json();
          setFormData({
            title: data.title, description: data.description, location: data.location,
            city: data.city, state: data.state, price: data.price.toString(),
            pricingType: data.pricingType, duration: data.duration?.toString() || '',
            maxCapacity: data.maxCapacity?.toString() || '', category: data.category || '',
          });
          setExistingImages(data.images || []);
        }
        if (availRes.ok) {
          const avails = await availRes.json();
          const dates = avails.map((a: any) => new Date(a.date));
          setSelectedDates(dates);
          const prices: Record<string, number> = {};
          const slots: Record<string, number> = {};
          avails.forEach((a: any) => { prices[a.date] = a.price; slots[a.date] = a.maxParticipants; });
          setPricePerDate(prices);
          setAvailableSlots(slots);
        }
      } catch { setError('Erro ao carregar dados'); }
      finally { setInitialLoading(false); }
    };
    load();
  }, [attractionId, isEdit]);

  // Auth check para nova atração
  useEffect(() => {
    if (isEdit) return;
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    if (!userId || role !== 'PROVIDER') router.push('/login');
  }, [isEdit, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ====== DATAS ======
  const addDateRange = () => {
    if (!rangeStart) return;
    const end = rangeEnd || rangeStart;
    const start = new Date(rangeStart + 'T12:00:00');
    const finish = new Date(end + 'T12:00:00');
    const newDates: Date[] = [];
    const cur = new Date(start);
    while (cur <= finish) {
      if (!selectedDates.find(d => d.toDateString() === cur.toDateString())) {
        const d = new Date(cur);
        newDates.push(d);
        setPricePerDate(prev => ({ ...prev, [d.toISOString()]: parseFloat(formData.price) || 0 }));
        setAvailableSlots(prev => ({ ...prev, [d.toISOString()]: parseInt(formData.maxCapacity) || 10 }));
      }
      cur.setDate(cur.getDate() + 1);
    }
    setSelectedDates(prev => [...prev, ...newDates]);
    setRangeStart(''); setRangeEnd('');
    setShowDatePicker(false);
  };

  const removeDate = (date: Date) => {
    setSelectedDates(prev => prev.filter(d => d.toDateString() !== date.toDateString()));
    const key = date.toISOString();
    setPricePerDate(prev => { const n = { ...prev }; delete n[key]; return n; });
    setAvailableSlots(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  // ====== IMAGENS ======
  const processFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const imgExts = ['jpg','jpeg','png','webp','gif','bmp'];
    const vidExts = ['mp4','webm','mov','avi'];
    const valid = arr.filter(f => {
      if (f.type.startsWith('image/') || f.type.startsWith('video/')) return true;
      const ext = f.name.toLowerCase().split('.').pop() || '';
      return imgExts.includes(ext) || vidExts.includes(ext);
    });
    if (valid.length + images.length + existingImages.length > 20) { setError('Máximo de 20 arquivos'); return; }
    const previews = valid.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...valid]);
    setImagePreviews(prev => [...prev, ...previews]);
    setError('');
  };

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  const uploadNewImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of images) {
      const fd = new FormData(); fd.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (res.ok) { const data = await res.json(); urls.push(data.url); }
      } catch { console.error('upload error'); }
    }
    return urls;
  };

  // ====== SUBMIT ======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const userId = localStorage.getItem('userId');
      const newImageUrls = images.length > 0 ? await uploadNewImages() : [];
      const allImages = [...existingImages, ...newImageUrls];

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        duration: formData.duration ? parseInt(formData.duration) : null,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
        images: allImages,
      };

      let attrId = attractionId;

      if (isEdit) {
        // EDITAR
        const res = await fetch(`/api/provider/attractions/${attractionId}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erro ao atualizar'); }
      } else {
        // CRIAR
        const res = await fetch('/api/provider/attractions', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, providerId: userId }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Erro ao criar');
        attrId = d.id;
        // Atualiza imagens na nova atração
        if (allImages.length > 0) {
          await fetch(`/api/provider/attractions/${attrId}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ images: allImages }),
          });
        }
      }

      // Salvar disponibilidades
      if (isEdit) {
        await fetch(`/api/provider/availabilities?attractionId=${attrId}`, { method: 'DELETE' });
      }
      if (selectedDates.length > 0) {
        const avails = selectedDates.map(date => ({
          attractionId: attrId,
          date: date.toISOString(),
          price: pricePerDate[date.toISOString()] || parseFloat(formData.price) || 0,
          maxParticipants: availableSlots[date.toISOString()] || parseInt(formData.maxCapacity) || 10,
        }));
        await fetch('/api/provider/availabilities', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ availabilities: avails }),
        });
      }

      router.push('/provider/my-attractions');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar atração');
    } finally { setLoading(false); }
  };

  if (initialLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Carregando...</p></div>;

  const totalFiles = existingImages.length + images.length;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">

        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <button type="button" onClick={() => router.push('/provider/dashboard')}
            className="w-full py-4 mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white text-base sm:text-lg font-bold rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3">
            📊 Voltar ao Dashboard
          </button>
          <Link href="/provider/my-attractions" className="text-blue-600 hover:text-blue-700 text-sm inline-block">
            ← Voltar para minhas atrações
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            {isEdit ? 'Editar Atração' : 'Cadastrar Nova Atração'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {isEdit ? 'Altere os dados da sua experiência turística' : 'Preencha os dados da sua experiência turística'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-5">

          {/* TÍTULO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título da Atração *</label>
            <input type="text" name="title" required value={formData.title} onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          {/* DESCRIÇÃO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Completa *</label>
            <textarea name="description" required rows={5} value={formData.description} onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
          </div>

          {/* LOCALIZAÇÃO + CIDADE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localização *</label>
              <input type="text" name="location" required value={formData.location} onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
              <input type="text" name="city" required value={formData.city} onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>

          {/* ESTADO + CATEGORIA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select name="state" required value={formData.state} onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                <option value="">Selecione</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select name="category" required value={formData.category} onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                <option value="">Selecione</option>
                <option value="Aventura">🏄 Aventura</option>
                <option value="Cultural">🏛️ Cultural</option>
                <option value="Ecoturismo">🌿 Ecoturismo</option>
                <option value="Praia">🏖️ Praia</option>
                <option value="Gastronomia">🍽️ Gastronomia</option>
                <option value="City Tour">🏙️ City Tour</option>
                <option value="Hospedagem">🏨 Hospedagem</option>
              </select>
            </div>
          </div>

          {/* PRECIFICAÇÃO + PREÇO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Precificação *</label>
              <select name="pricingType" value={formData.pricingType} onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white">
                <option value="PER_PERSON">Por Pessoa</option>
                <option value="FLAT_RATE">Preço Fechado (por grupo)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
              <input type="number" name="price" required step="0.01" min="0" value={formData.price} onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>

          {/* DURAÇÃO + CAPACIDADE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração (horas)</label>
              <input type="number" name="duration" step="0.5" min="0" value={formData.duration} onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade Máxima</label>
              <input type="number" name="maxCapacity" min="1" value={formData.maxCapacity} onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>

          {/* ====== DATAS DE DISPONIBILIDADE ====== */}
          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-base sm:text-lg font-semibold text-gray-800">📅 Datas de Disponibilidade</label>
              <button type="button" onClick={() => setShowDatePicker(!showDatePicker)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition">
                {showDatePicker ? 'Fechar' : '➕ Adicionar Datas'}
              </button>
            </div>

            {showDatePicker && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-700 font-medium mb-3">
                  Selecione uma data ou um período (data inicial até data final)
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Data inicial *</label>
                    <input type="date" value={rangeStart} min={today}
                      onChange={e => { setRangeStart(e.target.value); if (!rangeEnd || rangeEnd < e.target.value) setRangeEnd(e.target.value); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Data final (opcional para período)</label>
                    <input type="date" value={rangeEnd} min={rangeStart || today}
                      onChange={e => setRangeEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <button type="button" onClick={addDateRange} disabled={!rangeStart}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition whitespace-nowrap">
                    ✓ Confirmar
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Para adicionar um único dia deixe a data final igual à inicial, ou vazia.
                </p>
              </div>
            )}

            {selectedDates.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">{selectedDates.length} data(s) selecionada(s)</h4>
                  <button type="button" onClick={() => { setSelectedDates([]); setPricePerDate({}); setAvailableSlots({}); }}
                    className="text-xs text-red-500 hover:text-red-700">Limpar todas</button>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((date, i) => {
                    const key = date.toISOString();
                    return (
                      <div key={i} className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="font-medium text-sm flex-1 min-w-[100px]">
                          📅 {date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">R$</span>
                            <input type="number" value={pricePerDate[key] ?? formData.price} step="0.01"
                              onChange={e => setPricePerDate(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                              className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm" placeholder="Preço" />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Vagas</span>
                            <input type="number" min="1" value={availableSlots[key] ?? formData.maxCapacity ?? 10}
                              onChange={e => setAvailableSlots(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                              className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm" />
                          </div>
                          <button type="button" onClick={() => removeDate(date)}
                            className="text-red-400 hover:text-red-600 text-lg leading-none px-1">✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedDates.length === 0 && !showDatePicker && (
              <p className="text-sm text-gray-400 italic">Nenhuma data adicionada ainda.</p>
            )}
          </div>

          {/* ====== FOTOS E VÍDEOS ====== */}
          <div className="border-t border-gray-200 pt-5">
            <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
              📸 Fotos e Vídeos ({totalFiles}/20)
            </label>

            {/* Área de drag & drop */}
            <div
              onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
              onDragOver={handleDragOver} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <div className="text-4xl mb-2">📁</div>
              <p className="text-sm text-gray-600 font-medium">Clique para selecionar ou arraste e solte</p>
              <p className="text-xs text-gray-400 mt-1">Imagens: JPG, PNG, WEBP (até 15MB) | Vídeos: MP4, WEBM (até 100MB)</p>
              <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden"
                onChange={e => { if (e.target.files?.length) processFiles(e.target.files); }} />
            </div>

            {/* Imagens existentes */}
            {existingImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Fotos atuais:</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {existingImages.map((url, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-xl" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Novas imagens */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Novas fotos:</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {imagePreviews.map((url, i) => (
                    <div key={i} className="relative group aspect-square">
                      {images[i]?.type.startsWith('video/') ? (
                        <video src={url} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                      )}
                      <button type="button" onClick={() => {
                        URL.revokeObjectURL(imagePreviews[i]);
                        setImages(prev => prev.filter((_, idx) => idx !== i));
                        setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                      }} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ERROS E BOTÃO */}
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
          {success && <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white text-lg font-bold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
            {loading ? 'Salvando...' : isEdit ? '✅ Salvar Alterações' : '🚀 Cadastrar Atração'}
          </button>
        </form>
      </div>
    </div>
  );
}
