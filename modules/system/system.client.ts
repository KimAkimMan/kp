import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { UploadResult, PresignedUploadUrl } from "@/lib/api/types";

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
  upload(file: File, type?: "image" | "document", prefix?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (type) formData.append("type", type);
    if (prefix) formData.append("prefix", prefix);
    return apiClient.post<ApiResponse<UploadResult>>("/upload", formData, {
      headers: {}, // Let browser set content-type with boundary
    });
  },
  getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds?: number) {
    const params = new URLSearchParams({ key, contentType });
    if (expiresInSeconds) params.set("expiresIn", String(expiresInSeconds));
    return apiClient.get<ApiResponse<PresignedUploadUrl>>(`/upload?${params.toString()}`);
  },
};
