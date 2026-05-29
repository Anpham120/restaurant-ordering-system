import type { ApiOrder, Order, OrderItem } from '../types/orderTracking';

export const deriveOrderStatus = (items: OrderItem[]): OrderItem['status'] => {
  if (items.length === 0) return 'Pending';
  if (items.every(item => item.status === 'Cancelled')) return 'Cancelled';
  if (items.every(item => item.status === 'Served' || item.status === 'Cancelled')) return 'Served';
  if (items.some(item => item.status === 'Ready')) return 'Ready';
  if (items.some(item => item.status === 'Preparing')) return 'Preparing';
  return 'Pending';
};

export const mapApiOrder = (apiOrder: ApiOrder, fallbackTableNumber: string): Order => {
  const items = apiOrder.items.map(item => ({
    id: item.id,
    menuItemName: item.menuItemName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    status: item.status,
    note: item.note
  }));

  return {
    orderId: apiOrder.id,
    orderCode: apiOrder.orderCode,
    tableNumber: apiOrder.tableNumber || fallbackTableNumber,
    status: deriveOrderStatus(items),
    items,
    placedAt: apiOrder.createdAt ? new Date(apiOrder.createdAt) : new Date()
  };
};
