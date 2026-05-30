import { api } from '../lib/apiClient';
import type { Area, Table, TableStatus } from '../types';

export const tableService = {
  getAreas: () =>
    api.get<Area[]>('/api/v1/areas'),

  getTables: (params?: { areaId?: string; status?: TableStatus }) => {
    const query = new URLSearchParams();
    if (params?.areaId) query.set('areaId', params.areaId);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return api.get<Table[]>(`/api/v1/tables${qs ? `?${qs}` : ''}`);
  },

  updateStatus: (id: string, status: TableStatus) =>
    api.patch<Table>(`/api/v1/tables/${id}/status`, { status }),
};
