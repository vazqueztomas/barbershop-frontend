import { useMemo, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Haircut, ServicePrice } from '../types';
import { haircutService } from '../services/haircutService';

interface DailyStats {
  date: string;
  dayName: string;
  revenue: number;
  count: number;
  tip: number;
  avgPrice: number;
}

type DateRange = 'all' | 'today' | 'week' | '15days' | '30days' | '3months' | 'year';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const getDayName = (dateStr: string): string => {
  let day: string;
  let month: string;
  let year: string;
  
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    day = parts[0];
    month = parts[1];
    year = parts[2];
  } else if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else {
    return '?';
  }
  
  if (day.length === 1) day = `0${day}`;
  if (month.length === 1) month = `0${month}`;
  
  const date = new Date(`${year}-${month}-${day}`);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateForComparison = (dateStr: string): string => {
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
    return dateStr;
  }
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length >= 3) {
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];
    if (day.length === 1) day = `0${day}`;
    if (month.length === 1) month = `0${month}`;
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

const DATE_RANGES: { key: DateRange; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Esta semana' },
  { key: '15days', label: 'Últimos 15 días' },
  { key: '30days', label: 'Últimos 30 días' },
  { key: '3months', label: 'Últimos 3 meses' },
  { key: 'year', label: 'Último año' },
];

export function Statistics() {
  const [haircuts, setHaircuts] = useState<Haircut[]>([]);
  const [servicePrices, setServicePrices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<DateRange>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [haircutsData, pricesData] = await Promise.all([
        haircutService.getAll(),
        haircutService.getServicePrices()
      ]);
      setHaircuts(haircutsData);
      setServicePrices(pricesData);
      const range = calculateDateRange(selectedRange, haircutsData);
      setStartDate(range.start);
      setEndDate(range.end);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDateFromString = (dateStr: string): Date => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    const parts2 = dateStr.split('-');
    if (parts2.length === 3) {
      return new Date(parseInt(parts2[0]), parseInt(parts2[1]) - 1, parseInt(parts2[2]));
    }
    return new Date();
  };

  const calculateDateRange = (range: DateRange, existingData?: Haircut[]): { start: string; end: string } => {
    const today = new Date();
    
    if (range === 'all' && existingData && existingData.length > 0) {
      const dates = existingData.map(h => getDateFromString(h.date));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      return {
        start: `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`,
        end: `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`,
      };
    }
    
    let start = new Date(today);
    switch (range) {
      case 'today':
        break;
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case '15days':
        start.setDate(today.getDate() - 15);
        break;
      case '30days':
        start.setDate(today.getDate() - 30);
        break;
      case '3months':
        start.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        break;
      case 'all':
      default:
        start.setMonth(today.getMonth() - 1);
        break;
    }
    
    return {
      start: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
      end: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (haircuts.length > 0) {
      const range = calculateDateRange(selectedRange, haircuts);
      setStartDate(range.start);
      setEndDate(range.end);
    }
  }, [selectedRange, haircuts]);

  const filteredHaircuts = useMemo(() => {
    if (!startDate || !endDate) return haircuts;
    return haircuts.filter(h => {
      const haircutDate = formatDateForComparison(h.date);
      return haircutDate >= startDate && haircutDate <= endDate;
    });
  }, [haircuts, startDate, endDate]);

  const dailyStats: DailyStats[] = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const stats: Map<string, DailyStats> = new Map();
    const start = getDateFromString(startDate);
    const end = getDateFromString(endDate);
    const current = new Date(start);
    
    while (current <= end) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      stats.set(dateStr, {
        date: dateStr,
        dayName: getDayName(dateStr),
        revenue: 0,
        count: 0,
        tip: 0,
        avgPrice: 0,
      });
      current.setDate(current.getDate() + 1);
    }
    
    filteredHaircuts.forEach(h => {
      const dateStr = formatDateForComparison(h.date);
      const existing = stats.get(dateStr);
      if (existing) {
        let haircutCount = h.count;
        if (haircutCount === 0) {
          const servicePrice = servicePrices.find(sp => sp.serviceName === h.serviceName);
          const basePrice = servicePrice?.basePrice || 8000;
          haircutCount = Math.round(h.price / basePrice);
        }
        existing.count += haircutCount;
        existing.revenue += h.price;
        existing.tip += h.tip || 0;
        existing.avgPrice = existing.count > 0 ? existing.revenue / existing.count : 0;
      }
    });
    
    return Array.from(stats.values());
  }, [filteredHaircuts, startDate, endDate, servicePrices]);

  const getLegacyCount = (haircut: Haircut): number => {
    if (haircut.count > 0) return haircut.count;
    const servicePrice = servicePrices.find(sp => sp.serviceName === haircut.serviceName);
    const basePrice = servicePrice?.basePrice || 8000;
    return Math.round(haircut.price / basePrice);
  };

  const serviceStats = useMemo(() => {
    const serviceMap = new Map<string, { count: number; revenue: number }>();

    filteredHaircuts.forEach((haircut) => {
      const service = haircut.serviceName;
      const existing = serviceMap.get(service) || { count: 0, revenue: 0 };
      const haircutCount = getLegacyCount(haircut);
      serviceMap.set(service, {
        count: existing.count + haircutCount,
        revenue: existing.revenue + haircut.price,
      });
    });

    const totalCount = filteredHaircuts.reduce((sum, h) => sum + getLegacyCount(h), 0);
    const stats = Array.from(serviceMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
      percentage: totalCount > 0 ? (data.count / totalCount) * 100 : 0,
    }));

    return stats.sort((a: { count: number }, b: { count: number }) => b.count - a.count);
  }, [filteredHaircuts, servicePrices]);

  const totalRevenue = useMemo(
    () => filteredHaircuts.reduce((sum, h) => sum + h.price, 0),
    [filteredHaircuts]
  );

  const totalTip = useMemo(
    () => filteredHaircuts.reduce((sum, h) => sum + (h.tip || 0), 0),
    [filteredHaircuts]
  );

  const avgDaily = useMemo(() => {
    const uniqueDays = new Set(filteredHaircuts.map((h) => formatDateForComparison(h.date))).size;
    return uniqueDays > 0 ? totalRevenue / uniqueDays : 0;
  }, [filteredHaircuts, totalRevenue]);

  const topService = serviceStats[0];

  if (loading) {
    return <div className="empty-state">Cargando estadísticas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 py-3 mb-6">
        {DATE_RANGES.map((range) => (
          <button
            key={range.key}
            onClick={() => setSelectedRange(range.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              selectedRange === range.key
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {range.label}
          </button>
        ))}
        <span className="ml-auto text-gray-500 text-sm self-center flex items-center gap-2">
          <span>({filteredHaircuts.length} registros)</span>
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Refrescar datos"
          >
            🔄
          </button>
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Ingresos</span>
          <span className="block text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Propinas</span>
          <span className="block text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalTip)}</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Cortes</span>
          <span className="block text-2xl font-bold text-gray-900 mt-1">{dailyStats.reduce((sum, d) => sum + d.count, 0)}</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Promedio Diario</span>
          <span className="block text-2xl font-bold text-gray-900 mt-1">{formatCurrency(avgDaily)}</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Servicio Popular</span>
          <span className="block text-xl font-bold text-gray-900 mt-1">{topService?.name || '-'}</span>
          <span className="text-sm text-gray-500">{topService?.count || 0} cortes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Ingresos por Dia</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} />
              <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
              <Tooltip labelFormatter={(value) => value} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Propinas por Dia</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} />
              <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
              <Tooltip labelFormatter={(value) => value} />
              <Area
                type="monotone"
                dataKey="tip"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Cantidad de Cortes por Dia</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} />
              <YAxis />
              <Tooltip labelFormatter={(value) => value} />
              <Bar dataKey="count" fill="#82ca9d" name="Cortes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Cortes por Dia</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip labelFormatter={(value) => value} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#0088FE"
                name="Cortes"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#00C49F"
                name="Ingresos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Distribucion por Servicio</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={serviceStats}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {serviceStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Propinas vs Ingresos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip labelFormatter={(value) => value} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                name="Ingresos"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="tip"
                stroke="#10B981"
                name="Propinas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <h3 className="text-lg font-semibold text-gray-900 p-5 border-b border-gray-100">Detalle por Servicio</h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium uppercase tracking-wider text-xs sticky top-0">
              <tr>
                <th className="px-5 py-3">Servicio</th>
                <th className="px-5 py-3">Cantidad</th>
                <th className="px-5 py-3">Ingresos</th>
                <th className="px-5 py-3">Participación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {serviceStats.map((service) => (
                <tr key={service.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{service.name}</td>
                  <td className="px-5 py-3 text-gray-600">{service.count}</td>
                  <td className="px-5 py-3 text-gray-600">{formatCurrency(service.revenue)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full transition-all duration-300"
                          style={{ width: `${service.percentage}%` }}
                        />
                      </div>
                      <span className="text-gray-600 text-xs font-medium w-12 text-right">{service.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
