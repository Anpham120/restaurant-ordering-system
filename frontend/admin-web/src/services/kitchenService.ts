import { api } from '../lib/apiClient';
import type { KitchenOrderItem, OrderItemStatus } from '../types';

export const kitchenService = {
  getOrderItems: (status?: string) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return api.get<KitchenOrderItem[]>(`/api/v1/kitchen/order-items${qs}`);
  },

  updateStatus: (id: string, status: OrderItemStatus) =>
    api.patch<KitchenOrderItem>(`/api/v1/kitchen/order-items/${id}/status`, { status }),
};
