import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Statistics } from './Statistics';
import { Haircut } from '../types';

const mockHaircuts: Haircut[] = [
  { id: '1', clientName: 'Juan', serviceName: 'Corte', price: 5000, date: '03/01/2026', count: 1, tip: 500 },
  { id: '2', clientName: 'Pedro', serviceName: 'Corte', price: 13000, date: '08/01/2026', count: 2, tip: 0 },
  { id: '3', clientName: 'Maria', serviceName: 'Corte', price: 60000, date: '09/01/2026', count: 8, tip: 1000 },
];

vi.mock('../services/haircutService', () => ({
  haircutService: {
    getAll: vi.fn(() => Promise.resolve(mockHaircuts)),
  },
}));

describe('Statistics Component', () => {
  beforeEach(async () => {
    render(<Statistics />);
    await waitFor(() => {
      expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
    });
  });

  it('renders summary statistics', () => {
    expect(screen.getByText('Total Ingresos')).toBeInTheDocument();
    expect(screen.getByText('Total Cortes')).toBeInTheDocument();
    expect(screen.getByText('Promedio Diario')).toBeInTheDocument();
    expect(screen.getByText('Servicio Popular')).toBeInTheDocument();
  });

  it('displays correct haircut count from CSV data', () => {
    expect(screen.getByText('3 cortes')).toBeInTheDocument();
  });

  it('renders date range buttons', () => {
    expect(screen.getByText('Hoy')).toBeInTheDocument();
    expect(screen.getByText('Esta semana')).toBeInTheDocument();
    expect(screen.getByText('Últimos 15 días')).toBeInTheDocument();
    expect(screen.getByText('Últimos 30 días')).toBeInTheDocument();
    expect(screen.getByText('Últimos 3 meses')).toBeInTheDocument();
    expect(screen.getByText('Último año')).toBeInTheDocument();
  });

  it('shows correct total revenue from CSV data', () => {
    expect(screen.getByText('$ 78.000')).toBeInTheDocument();
  });

  it('renders chart cards', () => {
    expect(screen.getByText('Ingresos por Dia')).toBeInTheDocument();
    expect(screen.getByText('Cantidad de Cortes por Dia')).toBeInTheDocument();
    expect(screen.getByText('Distribucion por Servicio')).toBeInTheDocument();
    expect(screen.getByText('Cortes por Dia')).toBeInTheDocument();
  });

  it('renders service table', () => {
    expect(screen.getByText('Detalle por Servicio')).toBeInTheDocument();
    expect(screen.getByText('Servicio')).toBeInTheDocument();
    expect(screen.getByText('Cantidad')).toBeInTheDocument();
    expect(screen.getByText('Ingresos')).toBeInTheDocument();
    expect(screen.getByText('Participacion')).toBeInTheDocument();
  });

  it('shows correct service count in table', () => {
    expect(screen.getByText('Corte', { selector: 'td' })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

describe('Statistics date filtering', () => {
  beforeEach(async () => {
    render(<Statistics />);
    await waitFor(() => {
      expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
    });
  });

  it('shows all 3 haircuts when selecting "Último año"', async () => {
    const yearButton = screen.getByText('Último año');
    fireEvent.click(yearButton);
    
    await waitFor(() => {
      expect(screen.getByText('3 cortes')).toBeInTheDocument();
    });
  });

  it('shows correct total revenue when selecting range', async () => {
    const yearButton = screen.getByText('Último año');
    fireEvent.click(yearButton);
    
    await waitFor(() => {
      expect(screen.getByText('$ 78.000')).toBeInTheDocument();
    });
  });
});

describe('Statistics with empty data', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mock('../services/haircutService', () => ({
      haircutService: {
        getAll: vi.fn(() => Promise.resolve([])),
      },
    }));
    render(<Statistics />);
    await waitFor(() => {
      expect(screen.queryByText('Cargando estadísticas...')).not.toBeInTheDocument();
    });
  });

  it('handles empty haircuts array', () => {
    expect(screen.getByText('Total Ingresos')).toBeInTheDocument();
    expect(screen.getByText('0 cortes')).toBeInTheDocument();
  });
});
