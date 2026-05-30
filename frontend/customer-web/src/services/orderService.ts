import { api } from '../lib/apiClient';
import type { CartItem } from '../types/menu';

export interface TableSessionInfo {
  id: string;
  tableId: string;
  tableNumber: string;
  status: string;
  openedAt: string;
  sessionToken: string;
}

export interface OrderItemRequest {
  menuItemId: string;
  quantity: number;
  note?: string;
}

export interface OrderResponse {
  id: string;
  orderCode: string;
  tableSessionId: string;
  status: string;
  items: { id: string; menuItemName: string; unitPrice: number; quantity: number; status: string; note?: string }[];
}

export const orderService = {
  getSessionByToken: (token: string) =>
    api.get<TableSessionInfo>(`/api/v1/table-sessions/by-token/${encodeURIComponent(token)}`),

  createOrder: (sessionToken: string, cartItems: CartItem[]) =>
    api.post<OrderResponse>('/api/v1/orders', {
      sessionToken,
      idempotencyKey: `${sessionToken}-${Date.now()}`,
      items: cartItems.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity, note: i.note || undefined })),
    }),
};
