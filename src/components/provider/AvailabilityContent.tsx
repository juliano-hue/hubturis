'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Availability {
  id: string;
  date: string;
  price: number | null;
  maxParticipants: number;
  isAvailable: boolean;
}

interface AvailabilityContentProps {
  attractionId: string;
}

export default function AvailabilityContent({ attractionId }: AvailabilityContentProps) {
  const router = useRouter();

  console.log('📅 attractionId recebido:', attractionId);

  const [attraction, setAttraction] = useState<any>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Para seleção de datas
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Configurações para as datas
  const [price, setPrice] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [weekDays, setWeekDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📅 Buscando dados da atração:', attractionId);
        const res = await fetch(`/api/provider/attractions/${attractionId}`);
        const data = await res.json();
        console.log('📅 Dados da atração:', data);
        setAttraction(data);
        setAvailabilities(data.availabilities || []);
        console.log('📅 Disponibilidades existentes:', data.availabilities?.length || 0);
      } catch (error) {
        console.error('Erro:', error);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (attractionId) {
      fetchData();
    }
  }, [attractionId]);

  const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const addSelectedDates = async () => {
    if (selectedDates.length === 0) {
      setError('Selecione pelo menos uma data no calendário');
      return;
    }

    console.log('📅 ===== ADICIONANDO DATAS =====');
    console.log('📅 attractionId:', attractionId);
    console.log('📅 Quantidade de datas:', selectedDates.length);
    console.log('📅 Preço:', price);
    console.log('📅 Capacidade:', maxParticipants);
    console.log('📅 Primeira data:', selectedDates[0]?.toISOString());

    setSaving(true);
    setError('');
    setSuccess('');

    let added = 0;
    let failed = 0;
    let skipped = 0;

    for (const date of selectedDates) {
      const dateStr = date.toISOString().split('T')[0];
      const existing = availabilities.find(a => a.date.split('T')[0] === dateStr);
      
      if (existing) {
        console.log(`📅 Data ${dateStr} já existe, pulando...`);
        skipped++;
        continue;
      }

      try {
        const requestBody = {
          attractionId: attractionId,
          date: date.toISOString(),
          price: price ? parseFloat(price) : null,
          maxParticipants: maxParticipants,
          isAvailable: true,
        };
        
        console.log(`📅 Enviando requisição para data ${dateStr}:`, requestBody);

        const response = await fetch('/api/provider/availabilities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log(`📅 Resposta para data ${dateStr}:`, data);

        if (!response.ok) throw new Error(data.error || 'Erro ao adicionar');

        setAvailabilities(prev => [...prev, data.availability]);
        added++;
      } catch (err: any) {
        console.error(`❌ Erro ao adicionar data ${dateStr}:`, err.message);
        failed++;
      }
    }

    console.log(`📅 ===== RESULTADO =====`);
    console.log(`✅ Adicionadas: ${added}`);
    console.log(`⚠️ Já existiam: ${skipped}`);
    console.log(`❌ Falhas: ${failed}`);

    setSuccess(`✅ ${added} data(s) adicionada(s)! ${skipped > 0 ? `(${skipped} já existiam)` : ''} ${failed > 0 ? `(${failed} falhas)` : ''}`);
    setSelectedDates([]);
    setDateRange([null, null]);
    setShowDatePicker(false);
    setSaving(false);
  };

  const handleDateChange = (value: Value) => {
    console.log('📅 Calendário alterado:', value);
    
    if (Array.isArray(value) && value[0] && value[1]) {
      const start = value[0];
      const end = value[1];
      setDateRange([start, end]);
      const dates = getDatesBetween(start, end);
      console.log(`📅 Intervalo selecionado: ${dates.length} datas`);
      setSelectedDates(dates);
      setShowDatePicker(true);
    } else if (value instanceof Date) {
      console.log(`📅 Data única selecionada: ${value.toLocaleDateString('pt-BR')}`);
      setSelectedDates([value]);
      setDateRange([value, value]);
      setShowDatePicker(true);
    } else {
      console.log('📅 Nenhuma data selecionada');
      setSelectedDates([]);
      setShowDatePicker(false);
    }
  };

  const addRecurringWeekDays = async () => {
    const selectedDays = Object.entries(weekDays).filter(([_, selected]) => selected).map(([day]) => day);
    
    if (selectedDays.length === 0) {
      setError('Selecione pelo menos um dia da semana');
      return;
    }

    console.log('📅 Dias selecionados para recorrência:', selectedDays);

    const datesToAdd: Date[] = [];
    const today = new Date();
    const dayMap: Record<string, number> = {
      monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0
    };

    for (let week = 0; week < 8; week++) {
      for (const day of selectedDays) {
        const targetDay = dayMap[day];
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + (week * 7) + (targetDay - today.getDay() + 7) % 7);
        
        if (currentDate >= today) {
          datesToAdd.push(currentDate);
        }
      }
    }

    console.log(`📅 ${datesToAdd.length} datas geradas para recorrência`);
    setSelectedDates(datesToAdd);
    setShowDatePicker(true);
  };

  const toggleAvailability = async (availabilityId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/provider/availabilities/${availabilityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar');

      setAvailabilities(availabilities.map(a =>
        a.id === availabilityId ? { ...a, isAvailable: !currentStatus } : a
      ));
      setSuccess('✅ Status atualizado!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteAvailability = async (availabilityId: string) => {
    if (!confirm('Remover esta data?')) return;

    try {
      const response = await fetch(`/api/provider/availabilities/${availabilityId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao remover');

      setAvailabilities(availabilities.filter(a => a.id !== availabilityId));
      setSuccess('✅ Data removida!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  const availableDates = availabilities.map(a => new Date(a.date));

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const isAvailable = availableDates.some(d => d.toDateString() === date.toDateString());
      if (isAvailable) {
        return 'bg-green-100 text-green-800 rounded-full';
      }
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Disponibilidades</h1>
              <p className="text-gray-600 mt-1">{attraction?.title}</p>
              <p className="text-sm text-gray-400 mt-1">ID: {attractionId}</p>
            </div>
            <Link
              href={`/provider/attractions/${attractionId}`}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-2xl font-medium"
            >
              ← Voltar
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">📅 Selecionar Datas</h2>
              
              <Calendar
                onChange={handleDateChange}
                value={dateRange}
                selectRange={true}
                minDate={new Date()}
                tileClassName={tileClassName}
                className="rounded-lg w-full"
                locale="pt-BR"
              />
              
              <p className="text-sm text-gray-500 mt-2">
                💡 Clique em uma data para selecionar individualmente. Arraste para selecionar um intervalo.
              </p>

              {showDatePicker && selectedDates.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    📌 {selectedDates.length} data(s) selecionada(s):
                  </p>
                  <div className="max-h-32 overflow-y-auto mb-3">
                    {selectedDates.slice(0, 10).map((date, idx) => (
                      <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {date.toLocaleDateString('pt-BR')}
                      </span>
                    ))}
                    {selectedDates.length > 10 && (
                      <span className="text-xs text-gray-500">+{selectedDates.length - 10} mais</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço especial (opcional)
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Deixe em branco"
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacidade máxima
                      </label>
                      <input
                        type="number"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={addSelectedDates}
                    disabled={saving}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium disabled:bg-gray-400"
                  >
                    {saving ? 'Adicionando...' : `✅ Adicionar ${selectedDates.length} data(s)`}
                  </button>
                </div>
              )}
            </div>

            <div className="border rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">🔄 Dias Recorrentes</h2>
              <p className="text-sm text-gray-500 mb-4">
                Selecione os dias da semana que se repetirão nas próximas 8 semanas
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={weekDays.monday} onChange={(e) => setWeekDays({...weekDays, monday: e.target.checked})} />
                  <span>Segunda-feira</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={weekDays.tuesday} onChange={(e) => setWeekDays({...weekDays, tuesday: e.target.checked})} />
                  <span>Terça-feira</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={weekDays.wednesday} onChange={(e) => setWeekDays({...weekDays, wednesday: e.target.checked})} />
                  <span>Quarta-feira</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={weekDays.thursday} onChange={(e) => setWeekDays({...weekDays, thursday: e.target.checked})} />
                  <span>Quinta-feira</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={weekDays.friday} onChange={(e) => setWeekDays({...weekDays, friday: e.target.checked})} />
                  <span>Sexta-feira</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={weekDays.saturday} onChange={(e) => setWeekDays({...weekDays, saturday: e.target.checked})} />
                  <span>Sábado</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={weekDays.sunday} onChange={(e) => setWeekDays({...weekDays, sunday: e.target.checked})} />
                  <span>Domingo</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço especial
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Opcional"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidade
                  </label>
                  <input
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <button
                onClick={addRecurringWeekDays}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
              >
                🔄 Adicionar dias selecionados (próximas 8 semanas)
              </button>
            </div>
          </div>

          <div className="mt-8 border rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Datas Disponíveis ({availabilities.length})</h2>
            
            {availabilities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma data cadastrada</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {availabilities.map((avail) => (
                  <div
                    key={avail.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(avail.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {avail.maxParticipants} vagas
                        {avail.price && ` • R$ ${avail.price}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAvailability(avail.id, avail.isAvailable)}
                        className={`px-3 py-1 rounded-full text-xs ${
                          avail.isAvailable
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {avail.isAvailable ? 'Ativa' : 'Inativa'}
                      </button>
                      <button
                        onClick={() => deleteAvailability(avail.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-full text-xs hover:bg-red-700"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {success && <p className="text-green-600 text-center mt-6">{success}</p>}
          {error && <p className="text-red-600 text-center mt-6">{error}</p>}
        </div>
      </div>
    </div>
  );
}