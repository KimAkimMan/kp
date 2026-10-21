import { apiClient, type ApiResponse, type PaginatedResponse } from "@/lib/api/client";
import type { Advice, AdviceFilters, CreateAdviceInput } from "@/lib/api/types";

export const adviceApi = {
  list(filters?: AdviceFilters) {
    return apiClient.get<PaginatedResponse<Advice>>("/advice", filters);
  },
  get(id: string) {
    return apiClient.get<ApiResponse<Advice>>(`/advice/${encodeURIComponent(id)}`);
  },
  create(input: CreateAdviceInput) {
    return apiClient.post<ApiResponse<Advice>>("/advice", input);
  },
  updateStatus(id: string, status: string) {
    return apiClient.patch<ApiResponse<Advice>>(`/advice/${encodeURIComponent(id)}`, { status });
  },
  remove(id: string) {
    return apiClient.delete<ApiResponse<Advice>>(`/advice/${encodeURIComponent(id)}`);
  },
};
