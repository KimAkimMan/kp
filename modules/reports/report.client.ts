import { apiClient, type ApiResponse } from "@/lib/api/client";

/**
 * Hasil ringkasan laporan dari backend.
 */
export type ReportSummary = {
  filters: Record<string, string>;
  count: number;
  byStatus: Array<{
    status: string;
    _count: { _all: number };
  }>;
  totals: {
    _sum: Record<string, number | null>;
  };
};

/**
 * Klien API untuk domain laporan.
 * Semua method melempar `ApiClientError` jika backend mengembalikan status non-2xx.
 */
export const reportApi = {
  /**
   * Ambil ringkasan laporan dengan filter opsional.
   * @param query - Filter (status, periode, kecamatan)
   * @returns Promise berisi `data` ringkasan laporan
   * @throws {ApiClientError} 400 jika parameter tidak valid, 403 jika tidak berhak
   */
  summary(query?: {
    status?: string;
    periode?: string;
    kecamatan?: string;
  }) {
    return apiClient.get<ApiResponse<ReportSummary>>("/reports/summary", query);
  },
};
