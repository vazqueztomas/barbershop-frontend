import { useState, useEffect } from 'react';
import { Haircut, HaircutCreate } from '../types';
import { HaircutForm } from './HaircutForm';
import { HaircutList } from './HaircutList';
import { DailyHistoryList } from './DailyHistoryList';
import { DateSearchBar } from './DateSearchBar';
import { PriceEditor } from './PriceEditor';
import { Statistics } from './Statistics';
import { ExcelImporter } from './ExcelImporter';
import { ServicePricesConfig } from './ServicePricesConfig';
import { useHaircuts, useDailySummary } from '../hooks/useHaircuts';
import { useDateSearch } from '../hooks/useDateSearch';
import { useGlobalStats } from '../hooks/useGlobalStats';
import { haircutService } from '../services/haircutService';

export type TabType = 'sales' | 'history' | 'import' | 'stats' | 'config';

export function Dashboard() {
  const { haircuts, loading, error, addHaircut, updateHaircut, updatePrice, deleteHaircut, refetch } =
    useHaircuts();
  const { summary, history, refetch: refetchSummary } = useDailySummary();
  const { stats: globalStats, refetch: refetchGlobalStats, formatCurrency } = useGlobalStats();
  const {
    searchQuery,
    dateRange,
    filteredHistory,
    error: searchError,
    handleSearchByNaturalLanguage,
    handleCustomDateRange,
    handlePeriodClick,
    clearSearch,
  } = useDateSearch(history);
  const [editingHaircut, setEditingHaircut] = useState<Haircut | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('sales');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab !== 'sales') {
      setShowForm(false);
      setEditingHaircut(null);
    }
  }, [activeTab]);

  const handleCreate = () => {
    setEditingHaircut(null);
    setShowForm(true);
  };

  const handleEdit = (haircut: Haircut) => {
    setEditingHaircut(haircut);
    setShowForm(true);
  };

  const handleSubmit = async (haircutData: HaircutCreate) => {
    setIsSubmitting(true);
    try {
      if (editingHaircut) {
        await updateHaircut({ ...haircutData, id: editingHaircut.id });
        setShowForm(false);
        setEditingHaircut(null);
      } else {
        await addHaircut(haircutData);
      }
      refetchSummary();
      refetchGlobalStats();
    } catch (err) {
      console.error('Error saving haircut:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHaircut(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHaircut(id);
      refetchSummary();
      refetchGlobalStats();
    } catch (err) {
      console.error('Error deleting haircut:', err);
    }
  };

  const handlePriceEdit = (id: string, currentPrice: number) => {
    setEditingPrice(id);
    setNewPrice(currentPrice.toString());
  };

  const handlePriceSave = async (id: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
      return;
    }
    try {
      await updatePrice(id, price);
      setEditingPrice(null);
      setNewPrice('');
      refetchSummary();
      refetchGlobalStats();
    } catch (err) {
      console.error('Error updating price:', err);
    }
  };

  const handleCancelPriceEdit = () => {
    setEditingPrice(null);
    setNewPrice('');
  };

  const handleDeleteToday = async () => {
    if (!summary) return;
    if (!confirm(`¿Eliminar los ${summary.count} cortes de hoy?`)) {
      return;
    }
    try {
      await haircutService.deleteByDate(summary.date);
      refetchSummary();
      refetch();
      refetchGlobalStats();
    } catch (err) {
      console.error("Error deleting today's haircuts:", err);
    }
  };

  const avgTicket = summary?.count && summary.count > 0 
    ? summary.total / summary.count 
    : 0;

  if (loading) {
    return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Barbershop</h1>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Barbershop</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
        <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg shadow-gray-900/10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Hoy</p>
          <p className="text-4xl font-bold">{summary?.count || 0}</p>
          <p className="text-sm text-gray-400 mt-1">cortes</p>
        </div>
        <div className="bg-gray-800 text-white rounded-2xl p-6 shadow-lg">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Recaudado</p>
          <p className="text-2xl font-bold">
            {formatCurrency((summary?.total || 0) + (summary?.tip || 0))}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            servicio: {formatCurrency(summary?.total || 0)}
            {(summary?.tip || 0) > 0 && (
              <span className="text-green-400"> + prop: {formatCurrency(summary?.tip || 0)}</span>
            )}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-900">{globalStats.totalCuts}</p>
          <p className="text-sm text-gray-500 mt-1">Ingresos: {formatCurrency(globalStats.totalRevenue)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'sales'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('sales')}
              >
                Ventas
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'history'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('history')}
              >
                Historial
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'import'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('import')}
              >
                Importar Excel
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'stats'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('stats')}
              >
                Estadísticas
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'config'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('config')}
              >
                Configuración
              </button>
            </div>
            {activeTab === 'sales' && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                + Nuevo
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {showForm && (
            <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  {editingHaircut ? 'Editar Venta' : 'Nueva Venta'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <HaircutForm
                onSubmit={handleSubmit}
                initialData={editingHaircut ? {
                  clientName: editingHaircut.clientName,
                  serviceName: editingHaircut.serviceName,
                  price: editingHaircut.price,
                  date: editingHaircut.date,
                  time: editingHaircut.time,
                  count: editingHaircut.count,
                  tip: editingHaircut.tip
                } : undefined}
                onCancel={handleCancel}
              />
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              {haircuts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium mb-4">Sin ventas hoy</p>
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    + Agregar
                  </button>
                </div>
              ) : (
                <HaircutList
                  haircuts={haircuts}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onEditPrice={handlePriceEdit}
                />
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <DateSearchBar
                onSearch={handleSearchByNaturalLanguage}
                onClear={clearSearch}
                onPeriodSelect={handlePeriodClick}
                loading={loading}
                error={searchError}
              />
              <div className="mt-6">
                <DailyHistoryList
                  history={history}
                  searchQuery={searchQuery}
                  dateRange={dateRange}
                  filteredHistory={filteredHistory}
                  onClearSearch={clearSearch}
                />
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <ExcelImporter onImportComplete={() => {
              refetchSummary();
              refetch();
            }} />
          )}

          {activeTab === 'stats' && (
            <Statistics />
          )}

          {activeTab === 'config' && (
            <ServicePricesConfig onRefresh={() => {
              refetchSummary();
              refetch();
            }} />
          )}
        </div>
      </div>

      {editingPrice && (
        <PriceEditor
          currentPrice={parseFloat(newPrice)}
          newPrice={newPrice}
          onNewPriceChange={setNewPrice}
          onSave={() => handlePriceSave(editingPrice)}
          onCancel={handleCancelPriceEdit}
        />
      )}
    </div>
  );
}
