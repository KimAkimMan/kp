import { apiClient } from "@/lib/api/client";

export type HealthStatus = {
  status: string;
};

export const systemApi = {
  health() {
    return apiClient.get<HealthStatus>("/health");
  },
  ready() {
    return apiClient.get<HealthStatus>("/ready");
  },
};
