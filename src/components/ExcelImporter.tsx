import { useCallback, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { HaircutCreate, ServicePrice } from '../types';
import { haircutService } from '../services/haircutService';

interface ExcelImporterProps {
  onImportComplete: () => void;
}

interface PreviewItem extends HaircutCreate {
  id: string;
  serviceIndex: number;
}

export function ExcelImporter({ onImportComplete }: ExcelImporterProps) {
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [services, setServices] = useState<ServicePrice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bulkServiceIndex, setBulkServiceIndex] = useState<number>(0);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await haircutService.getServicePrices();
      setServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const parsePrice = (priceStr: string | number): number => {
    if (typeof priceStr === 'number') return priceStr;
    const cleaned = priceStr.replace(/[$\s]/g, '').replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(cleaned) || 0;
  };

  const parseDate = (dateValue: unknown): string => {
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      const day = String(dateValue.getDate()).padStart(2, '0');
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const year = dateValue.getFullYear();
      return `${day}/${month}/${year}`;
    }
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    if (!dateValue) return '';
    const dateStr = dateValue.toString().trim();
    const parts = dateStr.split(/[\/\-\.]/);
    if (parts.length >= 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const calculateCount = (price: number, service: ServicePrice): number => {
    if (service.basePrice > 0) {
      return Math.round(price / service.basePrice);
    }
    return 0;
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const isCSV = file.name.endsWith('.csv');

        if (isCSV) {
          const lines = data.trim().split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().toUpperCase().replace(/\r/g, ''));
          console.log('CSV headers:', headers);
          const fechaIndex = headers.findIndex(h => h === 'FECHA');
          const corteIndex = headers.findIndex(h => h === 'CORTE');
          console.log('Indices:', fechaIndex, corteIndex);

          if (fechaIndex === -1 || corteIndex === -1) {
            setError('El CSV debe tener columnas FECHA y CORTE');
            setPreview([]);
            return;
          }

          const parsedData: PreviewItem[] = lines.slice(1).map((line, idx) => {
            const cols = line.split(',').map(c => c.trim().replace(/\r/g, ''));
            console.log(`Line ${idx}:`, cols);
            const fecha = cols[fechaIndex] || '';
            const corte = cols[corteIndex] || '';
            return {
              id: `temp-${idx}`,
              clientName: 'Sin nombre',
              serviceName: services[0]?.serviceName || '',
              serviceIndex: 0,
              price: parsePrice(corte),
              date: parseDate(fecha),
              count: 0,
              tip: 0,
            };
          }).filter(item => item.date && item.price > 0);

          console.log('Parsed:', parsedData.slice(0, 3));

          if (parsedData.length === 0) {
            setError('No se encontraron datos válidos');
            setPreview([]);
          } else {
            setPreview(parsedData);
          }
          return;
        }

        const workbook = XLSX.read(data, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false }) as Record<string, string>[];

        console.log('Raw data:', jsonData.slice(0, 3));

        const parsedData: PreviewItem[] = jsonData
          .filter((row) => row['FECHA'] && row['CORTE'])
          .map((row, idx) => ({
            id: `temp-${idx}`,
            clientName: 'Sin nombre',
            serviceName: services[0]?.serviceName || '',
            serviceIndex: 0,
            price: parsePrice(row['CORTE']),
            date: parseDate(row['FECHA']),
            count: 0,
            tip: 0,
          }))
          .filter(item => item.price > 0);

        if (parsedData.length === 0) {
          setError('No se encontraron datos válidos');
          setPreview([]);
        } else {
          setPreview(parsedData);
        }
      } catch (err) {
        console.error(err);
        setError('Error al leer el archivo. Asegúrate de que sea un archivo válido.');
        setPreview([]);
      }
    };
    reader.readAsText(file);
  }, [services]);

  const updateItemService = (index: number, serviceIndex: number) => {
    setPreview(prev => prev.map((item, i) => {
      if (i === index) {
        const service = services[serviceIndex];
        return {
          ...item,
          serviceIndex,
          serviceName: service.serviceName,
          count: calculateCount(item.price, service),
        };
      }
      return item;
    }));
  };

  const applyBulkService = () => {
    setPreview(prev => prev.map(item => {
      const service = services[bulkServiceIndex];
      return {
        ...item,
        serviceIndex: bulkServiceIndex,
        serviceName: service.serviceName,
        count: calculateCount(item.price, service),
      };
    }));
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    setImporting(true);
    setError(null);

    try {
      for (let i = 0; i < preview.length; i++) {
        const item = preview[i];
        console.log(`Importing item ${i + 1}:`, JSON.stringify(item, null, 2));
        const { id, serviceIndex, ...haircutData } = item;
        const result = await haircutService.create(haircutData);
        console.log(`Item ${i + 1} created successfully:`, result);
      }
      console.log('All items imported successfully!');
      setSuccess(true);
      setPreview([]);
      onImportComplete();
    } catch (err: any) {
      console.error('Import error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(`Error al importar: ${err.response?.data?.detail || err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Importar desde Excel
        </h2>
      </div>

      <div className="p-6">
        <p className="text-sm text-gray-500 mb-4">
          Formato esperado: columna <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">FECHA</span> y columna <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">CORTE</span> (monto)
        </p>

        <div className="mb-4">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            id="excel-file"
            className="sr-only"
          />
          <label
            htmlFor="excel-file"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg cursor-pointer transition-colors duration-200 font-medium text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            📁 Seleccionar archivo
          </label>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">¡Datos importados exitosamente!</p>
            </div>
          </div>
        )}

        {preview.length > 0 && (
          <div className="mt-6">
            <div className="mb-4 p-3 bg-gray-50 border-l-4 border-gray-400 rounded-r-lg">
              <p className="text-sm text-gray-600 italic">
                ℹ️ Los cortes se calculan con los precios base actuales al momento de importar.
              </p>
            </div>

            {services.length > 0 && (
              <div className="flex flex-wrap gap-4 items-end mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Asignar a todos
                  </label>
                  <select
                    value={bulkServiceIndex}
                    onChange={(e) => setBulkServiceIndex(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  >
                    {services.map((service, index) => (
                      <option key={service.serviceName} value={index}>
                        {service.serviceName} ({formatCurrency(service.basePrice)})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={applyBulkService}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Aplicar a todos
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vista previa ({preview.length} registros)
              </h3>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm max-h-96 overflow-y-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Fecha
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Total
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Servicio
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Cortes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 50).map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 text-gray-700">{item.date}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          value={item.serviceIndex}
                          onChange={(e) => updateItemService(index, parseInt(e.target.value, 10))}
                          className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        >
                          {services.map((service, sIndex) => (
                            <option key={service.serviceName} value={sIndex}>
                              {service.serviceName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                        {item.count}
                      </td>
                    </tr>
                  ))}
                  {preview.length > 50 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-center text-gray-500 text-xs">
                        ... y {preview.length - 50} más
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleImport}
                disabled={importing}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Importando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Importar {preview.length} registros
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
