import React, { useState, useEffect, useMemo } from 'react';
import {
  format,
} from 'date-fns';
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
  const today = format(new Date(), 'yyyy-MM-dd');
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="p-2.5 sm:p-3 md:p-5 bg-gray-50 border-l-4 border-gray-400 rounded-lg">
        <p className="text-xs sm:text-sm md:text-lg text-gray-600 italic">
          ℹ️ Ingresa la cantidad de cortes y el precio se calcula automáticamente.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 md:gap-5">
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="clientName" className="block text-xs sm:text-sm md:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
            Cliente
          </label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nombre"
            className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 bg-white border border-gray-200 rounded-lg text-sm sm:text-base md:text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900"
            required
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-xs sm:text-sm md:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
            Fecha
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 bg-white border border-gray-200 rounded-lg text-sm sm:text-base md:text-lg text-gray-900 focus:outline-none focus:border-gray-900"
            required
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-xs sm:text-sm md:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
            Hora
          </label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 bg-white border border-gray-200 rounded-lg text-sm sm:text-base md:text-lg text-gray-900 focus:outline-none focus:border-gray-900"
          />
        </div>
        <div>
          <label htmlFor="tip" className="block text-xs sm:text-sm md:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
            Propina
          </label>
          <input
            type="number"
            id="tip"
            value={tip || ''}
            onChange={(e) => setTip(parseInt(e.target.value) || 0)}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 bg-white border border-gray-200 rounded-lg text-sm sm:text-base md:text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900"
          />
        </div>
      </div>

      {showNewService && addingServiceIndex !== null && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-900 mb-2">Nuevo servicio</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Nombre"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <input
                type="number"
                value={newServicePrice || ''}
                onChange={(e) => setNewServicePrice(parseInt(e.target.value, 10) || 0)}
                placeholder="Precio"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900"
              />
            </div>
            <div className="flex gap-2 col-span-2">
              <button
                type="button"
                onClick={handleAddNewService}
                disabled={!newServiceName.trim() || newServicePrice <= 0}
                className="flex-1 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-medium disabled:opacity-50"
              >
                ✓ Agregar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewService(false);
                  setNewServiceName('');
                  setNewServicePrice(0);
                  setAddingServiceIndex(null);
                }}
                className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-gray-700">
            Cortes
          </label>
          <button
            type="button"
            onClick={addEntry}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + Agregar
          </button>
        </div>

        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div key={entry.id} className="flex flex-col gap-2 p-2.5 bg-white border border-gray-200 rounded-lg sm:flex-row sm:items-end sm:gap-3">
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-500">
                    Cargando...
                  </div>
                ) : (
                  <select
                    value={entry.serviceName}
                    onChange={(e) => handleServiceSelect(entry.id, e.target.value, index)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                    required
                  >
                    <option value="">Servicio</option>
                    {services.map((service) => (
                      <option key={service.serviceName} value={service.serviceName}>
                        {service.serviceName}
                      </option>
                    ))}
                    <option value="__new__">+ Crear nuevo...</option>
                  </select>
                )}
              </div>
              <div className="w-16 sm:w-20">
                <input
                  type="number"
                  value={entry.count || ''}
                  onChange={(e) => updateEntry(entry.id, 'count', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900"
                  required
                />
              </div>
              <div className="w-20 px-3 py-2 bg-gray-100 rounded-lg text-center">
                <span className="text-sm font-medium text-gray-700">
                  {entry.price > 0 ? formatCurrency(entry.price) : '-'}
                </span>
              </div>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="self-center p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Total:</span>
          <span className="px-2 py-1 bg-gray-900 rounded-lg text-sm font-bold text-white">
            {formatCurrency(totalRevenue)}
          </span>
        </div>
        <div className="flex-1"></div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!clientName.trim() || totalCount === 0}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-medium disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}
