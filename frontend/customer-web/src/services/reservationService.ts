import { api } from '../lib/apiClient';

export interface ReservationResult {
  id: string;
  reservationCode: string;
  status: string;
}

export interface CreateReservationRequest {
  customerName: string;
  phone: string;
  guestCount: number;
  reservationTime: string;
  note?: string;
}

export const reservationService = {
  create: (data: CreateReservationRequest) =>
    api.post<ReservationResult>('/api/v1/reservations', data),

  getByCode: (code: string) =>
    api.get<ReservationResult>(`/api/v1/reservations/${encodeURIComponent(code)}`),
};
