import { apiClient } from './client';
import type { Priority, PriorityCreate, PriorityUpdate } from '../types/api';

export interface PriorityFilterParams {
  status?: string;
  priority_level?: string;
}

export const prioritiesApi = {
  async getPriorities(params?: PriorityFilterParams): Promise<Priority[]> {
    const queryParams: Record<string, string> = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.priority_level) queryParams.priority_level = params.priority_level;

    return apiClient<Priority[]>('/priorities', { params: queryParams });
  },

  async createPriority(payload: PriorityCreate): Promise<Priority> {
    return apiClient<Priority>('/priorities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updatePriority(id: string, payload: PriorityUpdate): Promise<Priority> {
    return apiClient<Priority>(`/priorities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deletePriority(id: string): Promise<void> {
    return apiClient<void>(`/priorities/${id}`, {
      method: 'DELETE',
    });
  },
};
