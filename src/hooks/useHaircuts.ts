import { useState, useEffect, useCallback } from 'react';
import { Haircut, DailySummary, DailyHistory, HaircutCreate } from '../types';
import { haircutService } from '../services/haircutService';

export function useHaircuts() {
  const [haircuts, setHaircuts] = useState<Haircut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHaircuts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await haircutService.getAll();
      setHaircuts(data);
      setError(null);
    } catch (err) {
      setError('Error al obtener los cortes');
    } finally {
      setLoading(false);
    }
  }, []);

  const addHaircut = async (haircut: HaircutCreate) => {
    try {
      await haircutService.create(haircut);
      await fetchHaircuts();
    } catch (err) {
      setError('Error al agregar el corte');
      throw err;
    }
  };

  const updateHaircut = async (haircut: Haircut) => {
    try {
      await haircutService.update(haircut);
      await fetchHaircuts();
    } catch (err) {
      setError('Error al actualizar el corte');
      throw err;
    }
  };

  const updatePrice = async (id: string, newPrice: number) => {
    try {
      await haircutService.updatePrice(id, newPrice);
      await fetchHaircuts();
    } catch (err) {
      setError('Error al actualizar el precio');
      throw err;
    }
  };

  const deleteHaircut = async (id: string) => {
    try {
      await haircutService.delete(id);
      await fetchHaircuts();
    } catch (err) {
      setError('Error al eliminar el corte');
      throw err;
    }
  };

  useEffect(() => {
    fetchHaircuts();
  }, [fetchHaircuts]);

  return {
    haircuts,
    loading,
    error,
    addHaircut,
    updateHaircut,
    updatePrice,
    deleteHaircut,
    refetch: fetchHaircuts,
  };
}

export function useDailySummary() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [history, setHistory] = useState<DailyHistory>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const [todayData, historyData] = await Promise.all([
        haircutService.getTodaySummary(),
        haircutService.getDailyHistory(),
      ]);
      setSummary(todayData);
      setHistory(historyData);
      setError(null);
    } catch (err) {
      setError('Error al obtener el resumen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    history,
    loading,
    error,
    refetch: fetchSummary,
  };
}
