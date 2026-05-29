export interface OrderItem {
  id: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';
  note?: string;
}

export interface Order {
  orderId: string;
  orderCode: string;
  tableNumber: string;
  status: OrderItem['status'];
  items: OrderItem[];
  placedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    traceId?: string;
  };
}

export interface ApiOrderItem {
  id: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  status: OrderItem['status'];
  note?: string;
}

export interface ApiOrder {
  id: string;
  orderCode: string;
  tableSessionId: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  tableNumber?: string;
  createdAt?: string;
  items: ApiOrderItem[];
}

export interface OrderItemStatusEvent {
  orderItemId: string;
  orderId: string;
  status: OrderItem['status'];
}

export type RealtimeStatus = 'demo' | 'connecting' | 'connected' | 'polling' | 'offline';
