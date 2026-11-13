import { apiClient, type ApiResponse } from "@/lib/api/client";

export type ReferenceItem = { id: number; nama: string };
export type ReferencePeriod = ReferenceItem & { tahun: number; tanggalMulai: string | null; tanggalSelesai: string | null };

export const referenceDataApi = {
  categories: () => apiClient.get<ApiResponse<ReferenceItem[]>>("/reference-data/categories"),
  units: () => apiClient.get<ApiResponse<ReferenceItem[]>>("/reference-data/units"),
  periods: () => apiClient.get<ApiResponse<ReferencePeriod[]>>("/reference-data/periods"),
  districts: () => apiClient.get<ApiResponse<ReferenceItem[]>>("/reference-data/districts"),
  villages: (kecamatanId: number) => apiClient.get<ApiResponse<ReferenceItem[]>>("/reference-data/villages", { kecamatanId }),
};
