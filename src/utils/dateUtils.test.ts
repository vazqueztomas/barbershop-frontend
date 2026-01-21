import { describe, it, expect } from 'vitest';

const formatDateForComparison = (dateStr: string): string => {
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

const parseDateStr = (dateStr: string): Date => {
  const parts = dateStr.split(/[\/\-\.]/);
  let day = parts[0];
  let month = parts[1];
  const year = parts[2];
  if (day.length === 1) day = `0${day}`;
  if (month.length === 1) month = `0${month}`;
  return new Date(`${year}-${month}-${day}`);
};

describe('Date formatting utilities', () => {
  it('formats DD/MM/YYYY to YYYY-MM-DD', () => {
    expect(formatDateForComparison('03/01/2026')).toBe('2026-01-03');
    expect(formatDateForComparison('08/01/2026')).toBe('2026-01-08');
    expect(formatDateForComparison('09/01/2026')).toBe('2026-01-09');
  });

  it('handles single digit day and month', () => {
    expect(formatDateForComparison('3/1/2026')).toBe('2026-01-03');
    expect(formatDateForComparison('8/1/2026')).toBe('2026-01-08');
  });

  it('parses date strings correctly', () => {
    const date1 = parseDateStr('03/01/2026');
    expect(date1.getFullYear()).toBe(2026);
    expect(date1.getMonth()).toBe(0);
    expect(date1.getDate()).toBe(3);

    const date2 = parseDateStr('08/01/2026');
    expect(date2.getFullYear()).toBe(2026);
    expect(date2.getMonth()).toBe(0);
    expect(date2.getDate()).toBe(8);
  });
});

describe('Date filtering logic', () => {
  const mockHaircuts = [
    { id: '1', clientName: 'Juan', serviceName: 'Corte', price: 5000, date: '03/01/2026' },
    { id: '2', clientName: 'Pedro', serviceName: 'Corte', price: 13000, date: '08/01/2026' },
    { id: '3', clientName: 'Maria', serviceName: 'Corte', price: 60000, date: '09/01/2026' },
  ];

  it('filters haircuts within date range', () => {
    const startDate = '2026-01-01';
    const endDate = '2026-01-31';
    
    const filtered = mockHaircuts.filter(h => {
      const haircutDate = formatDateForComparison(h.date);
      return haircutDate >= startDate && haircutDate <= endDate;
    });
    
    expect(filtered.length).toBe(3);
    expect(filtered[0].price).toBe(5000);
    expect(filtered[1].price).toBe(13000);
    expect(filtered[2].price).toBe(60000);
  });

  it('calculates daily stats correctly', () => {
    const startDate = '2026-01-01';
    const endDate = '2026-01-31';
    
    const stats: Map<string, { count: number; revenue: number }> = new Map();
    const start = parseDateStr(startDate);
    const end = parseDateStr(endDate);
    const current = new Date(start);
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      stats.set(dateStr, { count: 0, revenue: 0 });
      current.setDate(current.getDate() + 1);
    }
    
    mockHaircuts.forEach(h => {
      const dateStr = formatDateForComparison(h.date);
      const existing = stats.get(dateStr);
      if (existing) {
        existing.count += 1;
        existing.revenue += h.price;
      }
    });
    
    const filteredStats = Array.from(stats.values()).filter(s => s.count > 0);
    
    expect(filteredStats.length).toBe(3);
    expect(filteredStats[0]).toEqual({ count: 1, revenue: 5000 });
    expect(filteredStats[1]).toEqual({ count: 1, revenue: 13000 });
    expect(filteredStats[2]).toEqual({ count: 1, revenue: 60000 });
  });

  it('calculates total revenue correctly', () => {
    const totalRevenue = mockHaircuts.reduce((sum, h) => sum + h.price, 0);
    expect(totalRevenue).toBe(78000);
  });

  it('calculates average daily correctly', () => {
    const totalRevenue = mockHaircuts.reduce((sum, h) => sum + h.price, 0);
    const uniqueDays = new Set(mockHaircuts.map(h => formatDateForComparison(h.date))).size;
    const avgDaily = uniqueDays > 0 ? totalRevenue / uniqueDays : 0;
    
    expect(uniqueDays).toBe(3);
    expect(avgDaily).toBe(26000);
  });
});
