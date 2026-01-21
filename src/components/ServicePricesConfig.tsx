import { useState, useEffect } from 'react';
import { ServicePrice } from '../types';
import { haircutService } from '../services/haircutService';

interface ServicePricesConfigProps {
  onRefresh?: () => void;
}

export function ServicePricesConfig({ onRefresh }: ServicePricesConfigProps) {
  const [services, setServices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await haircutService.getServicePrices();
      setServices(data);
    } catch (err) {
      console.error('Error fetching service prices:', err);
      setError('Error al cargar los precios de servicios');
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

  const startEdit = (service: ServicePrice) => {
    setEditingService(service.serviceName);
    setEditPrice(service.basePrice);
  };

  const cancelEdit = () => {
    setEditingService(null);
    setEditPrice(0);
  };

  const saveEdit = async (serviceName: string) => {
    try {
      setError(null);
      await haircutService.updateServicePrice(serviceName, editPrice);
      setEditingService(null);
      setSuccess('Precio actualizado correctamente');
      setTimeout(() => setSuccess(null), 3000);
      fetchServices();
      onRefresh?.();
    } catch (err) {
      console.error('Error updating service price:', err);
      setError('Error al actualizar el precio');
    }
  };

  const handleAddService = async () => {
    if (!newServiceName.trim() || newServicePrice <= 0) {
      setError('Por favor complete todos los campos');
      return;
    }

    try {
      setError(null);
      await haircutService.createServicePrice(newServiceName.trim(), newServicePrice);
      setShowAddForm(false);
      setNewServiceName('');
      setNewServicePrice(0);
      setSuccess('Servicio agregado correctamente');
      setTimeout(() => setSuccess(null), 3000);
      fetchServices();
      onRefresh?.();
    } catch (err: any) {
      console.error('Error creating service:', err);
      setError(err.response?.data?.detail || 'Error al crear el servicio');
    }
  };

  const handleDelete = async (serviceName: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${serviceName}"?`)) {
      return;
    }

    try {
      setError(null);
      await haircutService.deleteServicePrice(serviceName);
      setSuccess('Servicio eliminado correctamente');
      setTimeout(() => setSuccess(null), 3000);
      fetchServices();
      onRefresh?.();
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Error al eliminar el servicio');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Configuración de Precios Base
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Estos precios se usan para calcular la cantidad de cortes al momento de registrar.
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Precio Base
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service) => (
                <tr key={service.serviceName} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {service.serviceName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingService === service.serviceName ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(parseInt(e.target.value, 10) || 0)}
                          className="w-28 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                          min="0"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-700">
                        {formatCurrency(service.basePrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {editingService === service.serviceName ? (
                        <>
                          <button
                            onClick={() => saveEdit(service.serviceName)}
                            className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                          >
                            ✓ Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                          >
                            ✕ Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(service)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            title="Editar precio"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(service.serviceName)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            title="Eliminar servicio"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          {showAddForm ? (
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre del servicio
                </label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Ej: Diseño de cejas"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Precio
                </label>
                <input
                  type="number"
                  value={newServicePrice || ''}
                  onChange={(e) => setNewServicePrice(parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  min="0"
                />
              </div>
              <button
                onClick={handleAddService}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                ✓ Agregar
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewServiceName('');
                  setNewServicePrice(0);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar nuevo servicio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
