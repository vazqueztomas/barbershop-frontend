import { useState, useCallback, useMemo } from 'react';
import { DateRange, DailyHistory } from '../types';
import { getDateRangeForPeriod, filterHistoryByRange, getHistoryStats, DateRangeResult } from '../utils/dateUtils';
import { validateDateRange, validateNaturalDateInput } from '../utils/validation';

export function useDateSearch(initialHistory?: DailyHistory) {
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState<DailyHistory>(initialHistory || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => getHistoryStats(filteredHistory), [filteredHistory]);

  const handleSearchByNaturalLanguage = useCallback((query: string) => {
    setSearchQuery(query);
    setError(null);

    const validationError = validateNaturalDateInput(query);
    if (validationError) {
      setError(validationError);
      setDateRange(null);
      setFilteredHistory(initialHistory || []);
      return;
    }

    const rangeResult = getDateRangeForPeriod(query);
    
    if (!rangeResult) {
      setError('No se pudo interpretar la fecha. Intente con "hoy", "esta semana", "este mes", o una fecha específica.');
      setDateRange(null);
      setFilteredHistory(initialHistory || []);
      return;
    }

    const apiStartDate = rangeResult.startDate.toISOString().split('T')[0];
    const apiEndDate = rangeResult.endDate.toISOString().split('T')[0];

    const newDateRange: DateRange = {
      startDate: apiStartDate,
      endDate: apiEndDate,
      label: rangeResult.label,
    };

    setDateRange(newDateRange);

    if (initialHistory && initialHistory.length > 0) {
      const filtered = filterHistoryByRange(initialHistory, rangeResult.startDate, rangeResult.endDate);
      setFilteredHistory(filtered);
    }
  }, [initialHistory]);

  const handleCustomDateRange = useCallback((startDate: string, endDate: string) => {
    setSearchQuery('');
    setError(null);

    const validationError = validateDateRange(startDate, endDate);
    if (validationError) {
      setError(validationError);
      setDateRange(null);
      return;
    }

    const newDateRange: DateRange = {
      startDate,
      endDate,
      label: 'Rango personalizado',
    };

    setDateRange(newDateRange);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (initialHistory && initialHistory.length > 0) {
      const filtered = filterHistoryByRange(initialHistory, start, end);
      setFilteredHistory(filtered);
    }
  }, [initialHistory]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDateRange(null);
    setError(null);
    setFilteredHistory(initialHistory || []);
  }, [initialHistory]);

  const handlePeriodClick = useCallback((period: string) => {
    handleSearchByNaturalLanguage(period);
  }, [handleSearchByNaturalLanguage]);

  const updateHistory = useCallback((newHistory: DailyHistory) => {
    setFilteredHistory(newHistory);
    if (dateRange && newHistory.length > 0) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      const filtered = filterHistoryByRange(newHistory, start, end);
      setFilteredHistory(filtered);
    }
  }, [dateRange]);

  return {
    searchQuery,
    dateRange,
    filteredHistory,
    stats,
    loading,
    error,
    handleSearchByNaturalLanguage,
    handleCustomDateRange,
    handlePeriodClick,
    clearSearch,
    updateHistory,
  };
}
