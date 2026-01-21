import axios from 'axios';
import { DailySummary, DailyHistory, Haircut, HaircutCreate, ServicePrice } from '../types';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: `${API_URL}/haircuts`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const haircutService = {
  getAll: async (): Promise<Haircut[]> => {
    const response = await api.get<Haircut[]>('/');
    return response.data;
  },

  getById: async (id: string): Promise<Haircut> => {
    const response = await api.get<Haircut>(`/${id}`);
    return response.data;
  },

  create: async (haircut: HaircutCreate): Promise<Haircut> => {
    const response = await api.post<Haircut>('/create', haircut);
    return response.data;
  },

  update: async (haircut: Haircut): Promise<Haircut> => {
    const response = await api.put<Haircut>('/update', haircut);
    return response.data;
  },

  updatePrice: async (id: string, price: number): Promise<Haircut> => {
    const response = await api.patch<Haircut>(`/${id}/price`, { price });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/${id}`);
  },

  deleteByDate: async (date: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/history/date/${date}`);
    return response.data;
  },

  getTodaySummary: async (): Promise<DailySummary> => {
    const response = await api.get<DailySummary>('/history/today');
    return response.data;
  },

  getDailyHistory: async (): Promise<DailyHistory> => {
    const response = await api.get<DailyHistory>('/history/daily');
    return response.data;
  },

  getByDate: async (date: string): Promise<Haircut[]> => {
    const response = await api.get<Haircut[]>(`/history/date/${date}`);
    return response.data;
  },

  getServicePrices: async (): Promise<ServicePrice[]> => {
    const response = await api.get<ServicePrice[]>('/services/prices');
    return response.data;
  },

  getServicePrice: async (serviceName: string): Promise<ServicePrice> => {
    const response = await api.get<ServicePrice>(`/services/price/${encodeURIComponent(serviceName)}`);
    return response.data;
  },

  updateServicePrice: async (serviceName: string, basePrice: number): Promise<ServicePrice> => {
    const response = await api.put<ServicePrice>(`/services/prices/${encodeURIComponent(serviceName)}`, { basePrice });
    return response.data;
  },

  createServicePrice: async (serviceName: string, basePrice: number): Promise<ServicePrice> => {
    const response = await api.post<ServicePrice>('/services/prices', { serviceName, basePrice });
    return response.data;
  },

  deleteServicePrice: async (serviceName: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/services/prices/${encodeURIComponent(serviceName)}`);
    return response.data;
  },
};
