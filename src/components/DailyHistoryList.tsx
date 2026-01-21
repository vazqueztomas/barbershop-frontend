import { DailyHistory, DateRange } from '../types';
import { formatDisplayDate, getHistoryStats } from '../utils/dateUtils';

interface DailyHistoryProps {
  history: DailyHistory;
  searchQuery?: string;
  dateRange?: DateRange | null;
  filteredHistory?: DailyHistory;
  onClearSearch?: () => void;
}

export function DailyHistoryList({ 
  history, 
  searchQuery = '',
  dateRange = null,
  filteredHistory,
  onClearSearch 
}: DailyHistoryProps) {
  const displayHistory = filteredHistory || history;
  const filteredNoZero = displayHistory.filter(item => item.total > 0);
  const sortedHistory = [...filteredNoZero].sort((a, b) => b.date.localeCompare(a.date));
  const stats = getHistoryStats(displayHistory);

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '$0';
    }
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (sortedHistory.length === 0 && !dateRange) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Sin historial aún</p>
      </div>
    );
  }

  if (sortedHistory.length === 0 && dateRange) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium mb-4">No se encontraron datos para "{searchQuery}"</p>
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Ver todo el historial
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dateRange && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Período</p>
              <p className="text-lg font-bold text-gray-900">{dateRange.label}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Días</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalDays}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cortes</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalCount}</p>
            </div>
            <div className="md:text-right">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total</p>
              <p className="text-xl font-bold text-violet-600">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500">Promedio diario</p>
              <p className="text-lg font-semibold text-gray-700">{formatCurrency(stats.averageDaily)}</p>
            </div>
            {onClearSearch && (
              <button
                onClick={onClearSearch}
                className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/80 backdrop-blur-sm">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Fecha</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Clientes</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Total</th>
            </tr>
          </thead>
          <tbody>
            {sortedHistory.map((item, index) => (
              <tr 
                key={item.date} 
                className="transition-all duration-200 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-violet-600">
                        {new Date(item.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{formatDisplayDate(item.date)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleDateString('es-AR', { weekday: 'long', month: 'short' })}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {item.clients.slice(0, 3).map((client, i) => (
                      <span 
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {client}
                      </span>
                    ))}
                    {item.clients.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-200 text-gray-600">
                        +{item.clients.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-green-50 text-green-700 border border-green-100">
                    {formatCurrency(item.total)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
