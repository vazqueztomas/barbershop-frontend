import { Haircut } from '../types';

interface ServicesListProps {
  haircuts: Haircut[];
  onEditPrice: (id: string, currentPrice: number) => void;
}

export function ServicesList({ haircuts, onEditPrice }: ServicesListProps) {
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

  const servicesMap = haircuts.reduce((acc, haircut) => {
    const existing = acc.find(s => s.serviceName.toLowerCase() === haircut.serviceName.toLowerCase());
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ ...haircut, count: 1 });
    }
    return acc;
  }, [] as (Haircut & { count: number })[]);

  const uniqueServices = servicesMap;

  if (uniqueServices.length === 0) {
    return <div className="text-center py-8 text-gray-500">No hay servicios registrados</div>;
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full border-collapse border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Servicio</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Precio</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Hoy</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {uniqueServices.map((service) => (
            <tr key={service.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 border-b border-gray-200 border-r">
                <span className="inline-block px-2.5 py-1 bg-violet-100 text-violet-800 rounded-full text-xs font-medium">
                  {service.serviceName}
                </span>
              </td>
              <td className="px-4 py-3 border-b border-gray-200 border-r font-semibold text-gray-900">
                {formatCurrency(service.price)}
              </td>
              <td className="px-4 py-3 border-b border-gray-200 border-r">
                {service.count}
              </td>
              <td className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEditPrice(service.id, service.price)}
                    className="inline-flex items-center justify-center min-w-[36px] min-h-[36px] p-2 bg-gray-100 hover:bg-gray-600 text-gray-900 hover:text-white rounded-lg cursor-pointer text-sm font-medium transition-all duration-150 shadow-sm hover:shadow-md active:scale-95"
                  >
                    ✏️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
