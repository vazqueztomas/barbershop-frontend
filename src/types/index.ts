export interface Haircut {
  id: string;
  clientName: string;
  serviceName: string;
  price: number;
  date: string;
  time?: string;
  count: number;
  tip: number;
}

export interface HaircutCreate {
  clientName: string;
  serviceName: string;
  price: number;
  date: string;
  time?: string;
  count: number;
  tip: number;
}

export interface ServicePrice {
  serviceName: string;
  basePrice: number;
}

export interface DailySummary {
  date: string;
  count: number;
  total: number;
  tip: number;
}

export interface DailyHistoryItem {
  date: string;
  total: number;
  count: number;
  clients: string[];
}

export type DailyHistory = DailyHistoryItem[];

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ErrorResponse {
  detail: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

export interface SearchSuggestion {
  text: string;
  dateRange: DateRange;
  description: string;
}

export interface DateSearchResult {
  data: DailyHistory;
  dateRange: DateRange;
  totalCount: number;
  totalAmount: number;
}
