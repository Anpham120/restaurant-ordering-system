import { api } from '../lib/apiClient';
import type { MenuCategory, MenuItem } from '../types/menu';

export const menuService = {
  getCategories: () =>
    api.get<MenuCategory[]>('/api/v1/menu/categories'),

  getMenuItems: (params?: { categoryId?: string; keyword?: string }) => {
    const qs = new URLSearchParams({ isAvailable: 'true', pageSize: '100' });
    if (params?.categoryId) qs.set('categoryId', params.categoryId);
    if (params?.keyword) qs.set('keyword', params.keyword);
    return api.get<MenuItem[]>(`/api/v1/menu/items?${qs}`);
  },
};
