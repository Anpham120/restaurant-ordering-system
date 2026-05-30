import { api } from '../lib/apiClient';
import type { Reservation, TableSession } from '../types';

export const reservationService = {
  getAll: (params?: { status?: string; date?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.date) query.set('date', params.date);
    const qs = query.toString();
    return api.get<Reservation[]>(`/api/v1/reservations${qs ? `?${qs}` : ''}`);
  },

  confirm: (id: string, assignedTableId?: string) =>
    api.patch<Reservation>(`/api/v1/reservations/${id}/confirm`, { assignedTableId }),

  cancel: (id: string) =>
    api.patch<{ message: string }>(`/api/v1/reservations/${id}/cancel`),

  checkIn: (id: string) =>
    api.post<TableSession>(`/api/v1/reservations/${id}/check-in`),
};
