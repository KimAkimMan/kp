import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { ApiUser, AuthData } from "@/lib/api/types";

export const authApi = {
  login(input: { email: string; password: string }) {
    return apiClient.post<ApiResponse<AuthData>>("/auth/login", input);
  },
  logout() {
    return apiClient.post<ApiResponse<null>>("/auth/logout");
  },
  updateProfile(input: { nama?: string; email?: string }) {
    return apiClient.patch<ApiResponse<ApiUser>>("/auth/profile", input);
  },
  changePassword(input: { currentPassword: string; newPassword: string }) {
    return apiClient.post<ApiResponse<{ changed: true }>>("/auth/change-password", input);
  },
  me() {
    return apiClient.get<ApiResponse<ApiUser>>("/auth/me");
  },
};
