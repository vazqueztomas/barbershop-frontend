import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  isValid,
  isWithinInterval,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subWeeks,
  isToday as dateFnsIsToday,
  isYesterday as dateFnsIsYesterday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { DailyHistory, DailyHistoryItem } from '../types';

export interface DateRangeResult {
  startDate: Date;
  endDate: Date;
  label: string;
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: es });
}

export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateFnsIsToday(date)) {
    return 'Hoy';
  } else if (dateFnsIsYesterday(date)) {
    return 'Ayer';
  }
  return format(date, "EEE d 'de' MMM", { locale: es });
}

export function parseNaturalDate(input: string): Date | null {
  const today = new Date();
  const normalizedInput = input.toLowerCase().trim();

  const dateMappings: { [key: string]: () => Date } = {
    'hoy': () => today,
    'ayer': () => {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    },
    'esta semana': () => startOfWeek(today, { weekStartsOn: 1 }),
    'semana actual': () => startOfWeek(today, { weekStartsOn: 1 }),
    'semana': () => startOfWeek(today, { weekStartsOn: 1 }),
    'la semana': () => startOfWeek(today, { weekStartsOn: 1 }),
    'ultima semana': () => subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1),
    'semana pasada': () => subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1),
    'este mes': () => startOfMonth(today),
    'mes actual': () => startOfMonth(today),
    'el mes': () => startOfMonth(today),
    'mes': () => startOfMonth(today),
    'ultimo mes': () => subMonths(startOfMonth(today), 1),
    'mes pasado': () => subMonths(startOfMonth(today), 1),
    'este ano': () => startOfYear(today),
    'este año': () => startOfYear(today),
    'ano actual': () => startOfYear(today),
    'año actual': () => startOfYear(today),
    'el ano': () => startOfYear(today),
    'el año': () => startOfYear(today),
  };

  if (dateMappings[normalizedInput]) {
    return dateMappings[normalizedInput]();
  }

  const monthPatterns: { [key: string]: number } = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
    'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11,
    'ene': 0, 'feb': 1, 'mar': 2, 'abr': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11,
  };

  const monthYearPattern = /^([a-záéíóúüñ]+)\s*(\d{4})$/i;
  const matchMonthYear = normalizedInput.match(monthYearPattern);
  if (matchMonthYear) {
    const monthName = matchMonthYear[1];
    const year = parseInt(matchMonthYear[2]);
    const monthIndex = monthPatterns[monthName];
    if (monthIndex !== undefined) {
      return new Date(year, monthIndex, 1);
    }
  }

  const yearOnlyPattern = /^(\d{4})$/;
  const matchYear = normalizedInput.match(yearOnlyPattern);
  if (matchYear) {
    return new Date(parseInt(matchYear[1]), 0, 1);
  }

  const datePatterns: RegExp[] = [
    /^(\d{1,2})\/(\d{1,2})$/,
    /^(\d{1,2})-(\d{1,2})$/,
  ];

  for (const pattern of datePatterns) {
    const match = normalizedInput.match(pattern);
    if (match) {
      const [, day, month] = match;
      const parsedDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
  }

  return null;
}

export function getDateRangeForPeriod(period: string): DateRangeResult | null {
  const today = new Date();
  const startDate = parseNaturalDate(period);

  if (!startDate) return null;

  let endDate: Date;
  let label: string;

  const lowerPeriod = period.toLowerCase();

  if (lowerPeriod.includes('semana')) {
    if (lowerPeriod === 'semana' || lowerPeriod === 'la semana') {
      endDate = endOfWeek(today, { weekStartsOn: 1 });
      label = 'Esta semana';
    } else {
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      label = 'Semana del ' + format(startDate, 'd MMM', { locale: es });
    }
  } else if (lowerPeriod.includes('mes') && !lowerPeriod.includes('ultimo') && !lowerPeriod.includes('pasado')) {
    if (lowerPeriod === 'mes' || lowerPeriod === 'el mes') {
      endDate = endOfMonth(today);
      label = 'Este mes';
    } else {
      endDate = endOfMonth(startDate);
      label = format(startDate, 'MMMM yyyy', { locale: es });
    }
  } else if (lowerPeriod.includes('ultimo') || lowerPeriod.includes('pasado')) {
    endDate = endOfMonth(subMonths(today, 1));
    label = 'Mes pasado';
  } else if (lowerPeriod.includes('ano') || lowerPeriod.includes('año')) {
    if (lowerPeriod === 'ano' || lowerPeriod === 'año' || lowerPeriod === 'el ano' || lowerPeriod === 'el año') {
      endDate = endOfYear(today);
      label = 'Este año';
    } else {
      endDate = endOfYear(startDate);
      label = 'Año ' + format(startDate, 'yyyy');
    }
  } else if (lowerPeriod.includes('hoy')) {
    endDate = today;
    label = 'Hoy';
  } else if (lowerPeriod.includes('ayer')) {
    const yesterday = subDays(today, 1);
    endDate = yesterday;
    label = 'Ayer';
  } else if (/^\d{4}$/.test(lowerPeriod)) {
    endDate = endOfYear(startDate);
    label = 'Año ' + format(startDate, 'yyyy');
  } else if (/^[a-záéíóúüñ]+\s*\d{4}$/i.test(lowerPeriod)) {
    endDate = endOfMonth(startDate);
    label = format(startDate, 'MMMM yyyy', { locale: es });
  } else {
    endDate = startDate;
    label = format(startDate, 'd MMM yyyy', { locale: es });
  }

  return {
    startDate: startOfDay(startDate),
    endDate: endOfDay(endDate),
    label,
  };
}

export function isDateInRange(dateStr: string, startDate: Date, endDate: Date): boolean {
  const checkDate = parseISO(dateStr);
  return isWithinInterval(checkDate, { start: startDate, end: endDate });
}

export function filterHistoryByRange(
  history: DailyHistory,
  startDate: Date,
  endDate: Date
): DailyHistory {
  return history.filter(item => {
    const itemDate = parseISO(item.date);
    return isWithinInterval(itemDate, { start: startDate, end: endDate });
  });
}

export function getHistoryStats(history: DailyHistory): {
  totalDays: number;
  totalAmount: number;
  averageDaily: number;
  maxAmount: number;
  maxDate: string | null;
  totalCount: number;
} {
  const sortedItems = [...history].sort((a, b) => b.total - a.total);
  const maxItem = sortedItems[0];
  
  const totalAmount = history.reduce((sum, item) => sum + item.total, 0);
  const totalCount = history.reduce((sum, item) => sum + item.count, 0);

  return {
    totalDays: history.length,
    totalAmount,
    averageDaily: history.length > 0 ? totalAmount / history.length : 0,
    maxAmount: maxItem?.total || 0,
    maxDate: maxItem?.date || null,
    totalCount,
  };
}

export function getQuickPeriods(): { label: string; value: string }[] {
  return [
    { label: 'Hoy', value: 'hoy' },
    { label: 'Ayer', value: 'ayer' },
    { label: 'Esta semana', value: 'esta semana' },
    { label: 'Semana pasada', value: 'ultima semana' },
    { label: 'Este mes', value: 'este mes' },
    { label: 'Mes pasado', value: 'ultimo mes' },
  ];
}
