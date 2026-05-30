import { api } from '../lib/apiClient';
import type { InvoicePreview, PaymentMethod, TableSession } from '../types';

export interface Invoice {
  id: string;
  invoiceCode: string;
  tableSessionId: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  paidAt?: string;
}

export const billingService = {
  getInvoicePreview: (sessionId: string) =>
    api.get<InvoicePreview>(`/api/v1/table-sessions/${sessionId}/invoice-preview`),

  createInvoice: (tableSessionId: string, paymentMethod: PaymentMethod) =>
    api.post<Invoice>('/api/v1/invoices', { tableSessionId, paymentMethod }),

  getSessionByToken: (token: string) =>
    api.get<TableSession>(`/api/v1/table-sessions/by-token/${encodeURIComponent(token)}`),

  getInvoice: (invoiceId: string) =>
    api.get<Invoice>(`/api/v1/invoices/${invoiceId}`),
};
