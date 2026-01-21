import React, { useState, useEffect, useMemo } from 'react';
import { HaircutCreate, ServicePrice } from '../types';
import { haircutService } from '../services/haircutService';

interface HaircutFormProps {
  onSubmit: (haircut: HaircutCreate) => void;
  initialData?: HaircutCreate;
  onCancel?: () => void;
}

interface HaircutEntry {
  id: string;
  serviceName: string;
  count: number;
  price: number;
}

export function HaircutForm({ onSubmit, initialData, onCancel }: HaircutFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [services, setServices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewService, setShowNewService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number>(0);
  const [addingServiceIndex, setAddingServiceIndex] = useState<number | null>(null);

  const [clientName, setClientName] = useState(initialData?.clientName || '');
  const [date, setDate] = useState(initialData?.date || today);
  const [time, setTime] = useState(initialData?.time || '');
  const [tip, setTip] = useState<number>(initialData?.tip || 0);
  const [entries, setEntries] = useState<HaircutEntry[]>([
    { id: crypto.randomUUID(), serviceName: '', count: 0, price: 0 }
  ]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await haircutService.getServicePrices();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getServiceBasePrice = (serviceName: string): number => {
    const service = services.find(s => s.serviceName === serviceName);
    return service?.basePrice || 0;
  };

  const calculatePrice = (count: number, serviceName: string): number => {
    const basePrice = getServiceBasePrice(serviceName);
    return count * basePrice;
  };

  const addEntry = () => {
    setEntries(prev => [...prev, { id: crypto.randomUUID(), serviceName: '', count: 0, price: 0 }]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const updateEntry = (id: string, field: 'serviceName' | 'count', value: string | number) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id !== id) return entry;
      if (field === 'serviceName') {
        const newCount = entry.count;
        return {
          ...entry,
          serviceName: value as string,
          price: calculatePrice(newCount, value as string)
        };
      }
      if (field === 'count') {
        const newCount = value as number;
        return {
          ...entry,
          count: newCount,
          price: calculatePrice(newCount, entry.serviceName)
        };
      }
      return entry;
    }));
  };

  const handleAddNewService = async () => {
    if (!newServiceName.trim() || newServicePrice <= 0) return;

    try {
      await haircutService.createServicePrice(newServiceName.trim(), newServicePrice);
      await fetchServices();
      setShowNewService(false);
      setNewServiceName('');
      setNewServicePrice(0);
      setAddingServiceIndex(null);
    } catch (err) {
      console.error('Error creating service:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validEntries = entries.filter(e => e.serviceName && e.count > 0);

    for (const entry of validEntries) {
      const haircutData: HaircutCreate = {
        clientName,
        serviceName: entry.serviceName,
        price: entry.price,
        date,
        time: time || undefined,
        count: entry.count,
        tip: entry.count > 0 ? tip : 0
      };
      onSubmit(haircutData);
    }
  };

  const totalRevenue = useMemo(() =>
    entries.reduce((sum, e) => sum + e.price, 0) + tip,
    [entries, tip]
  );

  const totalCount = useMemo(() =>
    entries.reduce((sum, e) => sum + e.count, 0),
    [entries]
  );

  const serviceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      if (e.serviceName && e.count > 0) {
        counts[e.serviceName] = (counts[e.serviceName] || 0) + e.count;
      }
    });
    return counts;
  }, [entries]);

  const showAddServiceForm = (index: number) => {
    setAddingServiceIndex(index);
    setShowNewService(true);
    setNewServiceName('');
    setNewServicePrice(0);
  };

  const handleServiceSelect = (id: string, value: string, index: number) => {
    if (value === '__new__') {
      showAddServiceForm(index);
    } else {
      updateEntry(id, 'serviceName', value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="p-4 bg-gray-50 border-l-4 border-gray-400 rounded-lg">
        <p className="text-sm text-gray-600 italic">
          ℹ️ Ingresa la cantidad de cortes y el precio se calcula automáticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
            Cliente
          </label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nombre del cliente"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            required
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            required
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
            Hora (opcional)
          </label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>
        <div>
          <label htmlFor="tip" className="block text-sm font-medium text-gray-700 mb-2">
            Propina (opcional)
          </label>
          <input
            type="number"
            id="tip"
            value={tip || ''}
            onChange={(e) => setTip(parseInt(e.target.value) || 0)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>
      </div>

      {showNewService && addingServiceIndex !== null && (
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Crear nuevo servicio</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del servicio
              </label>
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Ej: Corte infantil"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio base
              </label>
              <input
                type="number"
                value={newServicePrice || ''}
                onChange={(e) => setNewServicePrice(parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button
                type="button"
                onClick={handleAddNewService}
                disabled={!newServiceName.trim() || newServicePrice <= 0}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Agregar y usar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewService(false);
                  setNewServiceName('');
                  setNewServicePrice(0);
                  setAddingServiceIndex(null);
                }}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Cortes
          </label>
          <button
            type="button"
            onClick={addEntry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + Agregar
          </button>
        </div>

        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div key={entry.id} className="flex items-end gap-4 p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex-1 min-w-[200px]">
                {loading ? (
                  <div className="w-full px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-500">
                    Cargando...
                  </div>
                ) : (
                  <select
                    value={entry.serviceName}
                    onChange={(e) => handleServiceSelect(entry.id, e.target.value, index)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    required
                  >
                    <option value="">Seleccionar servicio</option>
                    {services.map((service) => (
                      <option key={service.serviceName} value={service.serviceName}>
                        {service.serviceName} ({formatCurrency(service.basePrice)})
                      </option>
                    ))}
                    <option value="__new__">+ Crear nuevo servicio...</option>
                  </select>
                )}
              </div>
              <div className="w-24">
                <input
                  type="number"
                  value={entry.count || ''}
                  onChange={(e) => updateEntry(entry.id, 'count', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  required
                />
              </div>
              <div className="w-28 px-4 py-3 bg-gray-100 rounded-lg text-center">
                <span className="text-sm font-medium text-gray-700">
                  {entry.price > 0 ? formatCurrency(entry.price) : '-'}
                </span>
              </div>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="p-3 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Cortes:</span>
            <span className="text-lg font-semibold text-gray-900">{totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Servicios:</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(entries.reduce((sum, e) => sum + e.price, 0))}
            </span>
          </div>
          {tip > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
              <span className="text-sm text-green-700">Propina:</span>
              <span className="text-lg font-semibold text-green-700">
                {formatCurrency(tip)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg">
            <span className="text-sm text-gray-300">Total:</span>
            <span className="text-xl font-bold text-white">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!clientName.trim() || totalCount === 0}
            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}
