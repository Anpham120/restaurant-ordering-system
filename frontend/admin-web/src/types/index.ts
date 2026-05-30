// ── Auth ──────────────────────────────────────────────────────────────────────
export type UserRole = 'Manager' | 'Staff' | 'Kitchen' | 'Cashier';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}

// ── Area & Table ──────────────────────────────────────────────────────────────
export type TableStatus = 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Inactive';

export interface Area {
  id: string;
  name: string;
  description?: string;
}

export interface Table {
  id: string;
  areaId: string;
  areaName: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
}

// ── Reservation ───────────────────────────────────────────────────────────────
export type ReservationStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'CheckedIn' | 'NoShow';

export interface Reservation {
  id: string;
  reservationCode: string;
  customerName: string;
  phone: string;
  guestCount: number;
  reservationTime: string;
  note?: string;
  status: ReservationStatus;
  assignedTableId?: string;
}

// ── Table Session ─────────────────────────────────────────────────────────────
export type TableSessionStatus = 'Active' | 'Closed' | 'Cancelled';

export interface TableSession {
  id: string;
  tableId: string;
  reservationId?: string;
  sessionToken: string;
  status: TableSessionStatus;
  openedAt: string;
  closedAt?: string;
}

// ── Order ─────────────────────────────────────────────────────────────────────
export type OrderItemStatus = 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';

export interface KitchenOrderItem {
  id: string;
  orderId: string;
  orderCode: string;
  tableNumber: string;
  menuItemName: string;
  quantity: number;
  note?: string;
  status: OrderItemStatus;
  createdAt: string;
  startedAt?: string;
  readyAt?: string;
}

// ── Billing ───────────────────────────────────────────────────────────────────
export type PaymentMethod = 'Cash' | 'BankTransfer';

export interface InvoicePreview {
  tableSessionId: string;
  items: Array<{
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  totalAmount: number;
}

// ── API response wrapper ──────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
