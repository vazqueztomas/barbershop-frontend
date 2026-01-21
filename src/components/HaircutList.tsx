import { Haircut } from '../types';

interface HaircutListProps {
  haircuts: Haircut[];
  onEdit: (haircut: Haircut) => void;
  onDelete: (id: string) => void;
  onEditPrice: (id: string, currentPrice: number) => void;
}

export function HaircutList({ haircuts, onEdit, onDelete, onEditPrice }: HaircutListProps) {
  if (haircuts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No hay ventas registradas</p>
      </div>
    );
  }

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

  const formatTime = (dateStr: string, time?: string) => {
    if (time) {
      return time;
    }
    return new Date(dateStr).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="max-h-[calc(100vh-420px)] overflow-y-auto border border-gray-100 rounded-lg">
        <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50/80 backdrop-blur-sm">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Fecha</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Cliente</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Servicio</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Precio</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-24">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {haircuts.map((haircut, index) => (
            <tr 
              key={haircut.id} 
              className="transition-all duration-200 hover:bg-gray-50 border-b border-gray-100 last:border-0"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                {new Date(haircut.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {haircut.clientName}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                  {haircut.serviceName}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                {formatCurrency(haircut.price)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => onEdit(haircut)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-600 text-gray-600 hover:text-white transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-95"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEditPrice(haircut.id, haircut.price)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 hover:bg-orange-500 text-orange-600 hover:text-white transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-95"
                    title="Editar precio"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(haircut.id)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-95"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
