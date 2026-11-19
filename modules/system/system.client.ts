import { apiClient, type ApiResponse } from "@/lib/api/client";

export type HealthStatus = {
  status: string;
};

export const systemApi = {
  health() {
    return apiClient.get<ApiResponse<HealthStatus>>("/health");
  },
  ready() {
    return apiClient.get<ApiResponse<HealthStatus>>("/ready");
  },
};
