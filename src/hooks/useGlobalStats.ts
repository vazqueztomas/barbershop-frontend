import { useState, useEffect, useCallback } from 'react';
import { haircutService } from '../services/haircutService';
import { Haircut } from '../types';

interface GlobalStats {
  totalCuts: number;
  totalRevenue: number;
  averageTicket: number;
  firstCutDate: string | null;
}

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats>({
    totalCuts: 0,
    totalRevenue: 0,
    averageTicket: 0,
    firstCutDate: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalStats = useCallback(async () => {
    setLoading(true);
    try {
      const allHaircuts = await haircutService.getAll();
      
      const totalCuts = allHaircuts.length;
      const totalRevenue = allHaircuts.reduce((sum, haircut) => sum + haircut.price, 0);
      const averageTicket = totalCuts > 0 ? totalRevenue / totalCuts : 0;
      
      const sortedHaircuts = [...allHaircuts].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const firstCutDate = sortedHaircuts.length > 0 ? sortedHaircuts[0].date : null;

      setStats({
        totalCuts,
        totalRevenue,
        averageTicket,
        firstCutDate,
      });
      setError(null);
    } catch (err) {
      setError('Error al obtener las estadísticas globales');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return {
    stats,
    loading,
    error,
    refetch: fetchGlobalStats,
    formatCurrency,
    formatDate,
  };
}