import { apiClient, type ApiResponse } from "@/lib/api/client";

export type HealthStatus = {
  status: string;
};

/**
 * Klien API untuk domain sistem (health check dan readiness).
 * Semua method melempar `ApiClientError` jika backend mengembalikan status non-2xx.
 */
export const systemApi = {
  /**
   * Periksa kesehatan aplikasi.
   * @returns Promise berisi `data.status` ("ok" jika sehat)
   */
  health() {
    return apiClient.get<ApiResponse<HealthStatus>>("/health");
  },

  /**
   * Periksa kesiapan aplikasi dan koneksi database.
   * @returns Promise berisi `data.status` ("ready") dan `data.database` ("up")
   * @throws {ApiClientError} 503 jika konfigurasi atau database tidak valid
   */
  ready() {
    return apiClient.get<ApiResponse<HealthStatus>>("/ready");
  },
};
