import { apiClient, type ApiResponse, type PaginatedResponse } from "@/lib/api/client";
import type { ApiUser, UserFilters, CreateUserInput, UpdateUserInput } from "@/lib/api/types";

export const userApi = {
  list(filters?: UserFilters) {
    const { page, pageSize, ...rest } = filters ?? {};
    return apiClient.get<PaginatedResponse<ApiUser>>("/users", {
      page,
      pageSize,
      ...rest,
    });
  },
  get(id: number) {
    return apiClient.get<ApiResponse<ApiUser>>(`/users/${id}`);
  },
  create(input: CreateUserInput) {
    return apiClient.post<ApiResponse<ApiUser>>("/users", input);
  },
  update(id: number, input: UpdateUserInput) {
    return apiClient.patch<ApiResponse<ApiUser>>(`/users/${id}`, input);
  },
  remove(id: number) {
    return apiClient.delete<ApiResponse<ApiUser>>(`/users/${id}`);
  },
  resetPassword(id: number, password: string) {
    return apiClient.post<ApiResponse<{ reset: true }>>(`/users/${id}/reset-password`, { password });
  },
};
