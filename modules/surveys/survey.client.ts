import { apiClient, type ApiResponse, type PaginatedResponse } from "@/lib/api/client";
import type { ApiSurvey, ConvertSurveyInput, SurveyFilters, SurveyInput } from "@/lib/api/types";

/**
 * Klien API untuk domain survey lapangan.
 * Semua method melempar `ApiClientError` jika backend mengembalikan status non-2xx.
 */
export const surveyApi = {
  /**
   * Ambil daftar survey dengan paginasi dan filter.
   * @param filters - Filter dan paginasi (page, pageSize, status, search, kecamatan)
   * @returns Promise berisi `data` (array survey) dan `meta` paginasi
   * @throws {ApiClientError} 400 jika parameter paginasi tidak valid, 403 jika tidak berhak
   */
  list(filters?: SurveyFilters) {
    const { page, pageSize, ...rest } = filters ?? {};
    return apiClient.get<PaginatedResponse<ApiSurvey>>("/surveys", {
      page,
      pageSize,
      ...rest,
    });
  },

  /**
   * Ambil detail satu survey berdasarkan ID.
   * @param id - ID survey
   * @returns Promise berisi `data.survey`
   * @throws {ApiClientError} 404 jika survey tidak ditemukan, 403 jika tidak berhak
   */
  get(id: string) {
    return apiClient.get<ApiResponse<ApiSurvey>>(`/surveys/${encodeURIComponent(id)}`);
  },

  /**
   * Buat survey baru.
   * @param input - Data survey baru
   * @returns Promise berisi `data.survey` yang dibuat
   * @throws {ApiClientError} 400 jika input tidak valid, 403 jika tidak berhak
   */
  create(input: SurveyInput) {
    return apiClient.post<ApiResponse<ApiSurvey>>("/surveys", input);
  },

  /**
   * Perbarui data survey berdasarkan ID.
   * @param id - ID survey
   * @param input - Field yang ingin diperbarui
   * @returns Promise berisi `data.survey` yang diperbarui
   * @throws {ApiClientError} 400 jika input tidak valid, 404 jika tidak ditemukan, 403 jika tidak berhak
   */
  update(id: string, input: Partial<SurveyInput>) {
    return apiClient.patch<ApiResponse<ApiSurvey>>(`/surveys/${encodeURIComponent(id)}`, input);
  },

  /**
   * Hapus survey berdasarkan ID.
   * @param id - ID survey
   * @returns Promise berisi `data` survey yang dihapus
   * @throws {ApiClientError} 404 jika tidak ditemukan, 403 jika tidak berhak
   */
  remove(id: string) {
    return apiClient.delete<ApiResponse<ApiSurvey>>(`/surveys/${encodeURIComponent(id)}`);
  },

  /**
   * Verifikasi survey.
   * @param id - ID survey
   * @param programId - ID program yang terkait (opsional)
   * @returns Promise berisi `data.survey` yang diverifikasi
   * @throws {ApiClientError} 400 jika input tidak valid, 403 jika tidak berhak
   */
  verify(id: string, programId?: number | null) {
    return apiClient.post<ApiResponse<ApiSurvey>>(
      `/surveys/${encodeURIComponent(id)}/verify`,
      { programId },
    );
  },

  /**
   * Konversi survey menjadi program.
   * @param id - ID survey
   * @param input - Data konversi (kode, nama, pj, periode, satuan, target, pagu)
   * @returns Promise berisi `data` hasil konversi
   * @throws {ApiClientError} 400 jika input tidak valid, 403 jika tidak berhak
   */
  convert(id: string, input: ConvertSurveyInput) {
    return apiClient.post<ApiResponse<unknown>>(
      `/surveys/${encodeURIComponent(id)}/convert`,
      input,
    );
  },

  /**
   * Ambil daftar foto survey.
   * @param id - ID survey
   * @returns Promise berisi array foto
   */
  photos(id: string) { return apiClient.get<ApiResponse<unknown[]>>(`/surveys/${encodeURIComponent(id)}/photos`); },

  /**
   * Upload foto survey.
   * @param id - ID survey
   * @param file - File foto
   * @param input - Metadata opsional (caption, latitude, longitude)
   * @returns Promise berisi `data` foto yang diupload
   */
  uploadPhoto(id: string, file: File, input?: { caption?: string; latitude?: number; longitude?: number }) { const body = new FormData(); body.append("file", file); if (input?.caption) body.append("caption", input.caption); if (input?.latitude !== undefined) body.append("latitude", String(input.latitude)); if (input?.longitude !== undefined) body.append("longitude", String(input.longitude)); return apiClient.request<ApiResponse<unknown>>(`/surveys/${encodeURIComponent(id)}/photos`, { method: "POST", body }); },

  /**
   * Hapus foto survey.
   * @param photoId - ID foto
   * @returns Promise berisi `data` foto yang dihapus
   */
  removePhoto(photoId: string) { return apiClient.delete<ApiResponse<unknown>>(`/surveys/photos/${encodeURIComponent(photoId)}`); },

  /**
   * Ambil daftar review survey.
   * @param id - ID survey
   * @returns Promise berisi array review
   */
  reviews(id: string) { return apiClient.get<ApiResponse<unknown[]>>(`/surveys/${encodeURIComponent(id)}/reviews`); },

  /**
   * Ambil riwayat status survey.
   * @param id - ID survey
   * @returns Promise berisi array riwayat status
   */
  statusHistory(id: string) { return apiClient.get<ApiResponse<unknown[]>>(`/surveys/${encodeURIComponent(id)}/status-history`); },

  /**
   * Ambil daftar link survey-program.
   * @param id - ID survey
   * @returns Promise berisi array link
   */
  links(id: string) { return apiClient.get<ApiResponse<unknown[]>>(`/surveys/${encodeURIComponent(id)}/links`); },

  /**
   * Buat link survey ke program.
   * @param id - ID survey
   * @param input - Data link (programId, relationType)
   * @returns Promise berisi `data` link yang dibuat
   */
  link(id: string, input: { programId: number; relationType?: string }) { return apiClient.post<ApiResponse<unknown>>(`/surveys/${encodeURIComponent(id)}/links`, input); },

  /**
   * Hapus link survey-program.
   * @param linkId - ID link
   * @returns Promise berisi `data` link yang dihapus
   */
  removeLink(linkId: string) { return apiClient.delete<ApiResponse<unknown>>(`/surveys/links/${encodeURIComponent(linkId)}`); },
};
