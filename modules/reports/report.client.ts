import { apiClient, type ApiResponse } from "@/lib/api/client";

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

export const reportApi = {
  summary(query?: {
    status?: string;
    periode?: string;
    kecamatan?: string;
  }) {
    return apiClient.get<ApiResponse<ReportSummary>>("/reports/summary", query);
  },
};
