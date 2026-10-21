import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { ApiUser, AuthData } from "@/lib/api/types";

export const authApi = {
  login(input: { email: string; password: string }) {
    return apiClient.post<ApiResponse<AuthData>>("/auth/login", input);
  },
  logout() {
    return apiClient.post<ApiResponse<null>>("/auth/logout");
  },
  me() {
    return apiClient.get<ApiResponse<ApiUser>>("/auth/me");
  },
};
