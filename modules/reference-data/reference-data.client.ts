import { apiClient, type ApiResponse } from "@/lib/api/client";

export type ReferenceItem = { id: number; nama: string };
export type ReferencePeriod = ReferenceItem & { tahun: number; tanggalMulai: string | null; tanggalSelesai: string | null };

/**
 * Klien API untuk domain referensi data (master data formulir).
 * Semua method melempar `ApiClientError` jika backend mengembalikan status non-2xx.
 */
export const referenceDataApi = {
  /**
   * Ambil daftar kategori program.
   * @returns Promise berisi array kategori
   */
  categories: () => apiClient.get<ApiResponse<ReferenceItem[]>>("/reference-data/categories"),

  /**
   * Ambil daftar satuan ukuran.
   * @returns Promise berisi array satuan
   */
  units: () => apiClient.get<ApiResponse<ReferenceItem[]>>("/reference-data/units"),

  /**
   * Ambil daftar periode.
   * @returns Promise berisi array periode
   */
  periods: () => apiClient.get<ApiResponse<ReferencePeriod[]>>("/reference-data/periods"),

  /**
   * Ambil daftar kecamatan.
   * @returns Promise berisi array kecamatan
   */
  districts: () => apiClient.get<ApiResponse<ReferenceItem[]>>("/reference-data/districts"),

  /**
   * Ambil daftar desa/kelurahan berdasarkan ID kecamatan.
   * @param kecamatanId - ID kecamatan
   * @returns Promise berisi array desa/kelurahan
   */
  villages: (kecamatanId: number) => apiClient.get<ApiResponse<ReferenceItem[]>>("/reference-data/villages", { kecamatanId }),
};
