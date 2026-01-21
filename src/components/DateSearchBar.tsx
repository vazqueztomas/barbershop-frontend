import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getQuickPeriods, formatDateForAPI } from '../utils/dateUtils';
import { sanitizeInput } from '../utils/validation';

interface DateSearchBarProps {
  onSearch: (query: string, startDate?: string, endDate?: string) => void;
  onClear: () => void;
  onPeriodSelect: (period: string) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  placeholder?: string;
}

export function DateSearchBar({
  onSearch,
  onClear,
  onPeriodSelect,
  loading = false,
  error = null,
  className = '',
  placeholder = "Buscar por fecha: ej. 'hoy', 'esta semana', '15/01'",
}: DateSearchBarProps) {
  const [naturalInput, setNaturalInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const quickPeriods = getQuickPeriods();
  const today = new Date();

  const handleNaturalInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeInput(e.target.value);
    setNaturalInput(value);
    setIsCustomRange(false);
    setValidationError(null);
    setShowSuggestions(value.length > 0);

    if (!value.trim()) {
      onClear();
    }
  }, [onClear]);

  const handleNaturalInputSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (validationError || !naturalInput.trim()) return;

    onSearch(naturalInput);
    setShowSuggestions(false);
  }, [naturalInput, validationError, onSearch]);

  const handleQuickPeriodClick = useCallback((period: string) => {
    setNaturalInput(period);
    setStartDate('');
    setEndDate('');
    setIsCustomRange(false);
    setValidationError(null);
    setShowSuggestions(false);
    onPeriodSelect(period);
  }, [onPeriodSelect]);

  const handleCustomDateChange = useCallback((field: 'start' | 'end', value: string) => {
    if (field === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }

    setIsCustomRange(true);
    setNaturalInput('');
    setValidationError(null);

    if (startDate && endDate) {
      const start = field === 'start' ? value : startDate;
      const end = field === 'end' ? value : endDate;

      if (start && end) {
        onSearch('', start, end);
      }
    }
  }, [startDate, endDate, onSearch]);

  const handleClear = useCallback(() => {
    setNaturalInput('');
    setStartDate('');
    setEndDate('');
    setIsCustomRange(false);
    setValidationError(null);
    setShowSuggestions(false);
    onClear();
  }, [onClear]);

  useEffect(() => {
    if (error) {
      setValidationError(error);
    }
  }, [error]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`date-search-bar ${className}`}>
      <div className="date-search-content">
        <form onSubmit={handleNaturalInputSubmit} className="natural-input-form">
          <div className="form-group" ref={inputRef}>
            <input
              type="text"
              value={naturalInput}
              onChange={handleNaturalInputChange}
              placeholder={placeholder}
              className={`form-input ${validationError ? 'error' : ''}`}
              disabled={loading}
              autoComplete="off"
            />
            {naturalInput && (
              <button
                type="button"
                onClick={handleClear}
                className="clear-btn"
                disabled={loading}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        <div className="quick-periods">
          {quickPeriods.map((period) => (
            <button
              key={period.value}
              type="button"
              onClick={() => handleQuickPeriodClick(period.value)}
              className={`period-btn ${naturalInput === period.value ? 'active' : ''}`}
              disabled={loading}
              aria-pressed={naturalInput === period.value}
            >
              {period.label}
            </button>
          ))}
        </div>

        <div className="custom-date-range">
          <div className="date-inputs">
            <div className="form-group">
              <label htmlFor="start-date">Desde</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className={`form-input ${validationError ? 'error' : ''}`}
                disabled={loading}
                max={formatDateForAPI(today)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="end-date">Hasta</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className={`form-input ${validationError ? 'error' : ''}`}
                disabled={loading}
                max={formatDateForAPI(today)}
                min={startDate}
              />
            </div>
          </div>
        </div>

        {(validationError || error) && (
          <div className="error-message" role="alert">
            {validationError || error}
          </div>
        )}

        {loading && (
          <div className="loading-overlay" role="status" aria-live="polite">
            <div className="loading-spinner"></div>
            <span className="sr-only">Buscando...</span>
          </div>
        )}
      </div>
    </div>
  );
}
