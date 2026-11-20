import { apiClient, type ApiResponse, type PaginatedResponse } from "@/lib/api/client";
import type { Advice, AdviceFilters, CreateAdviceInput } from "@/lib/api/types";

/**
 * Klien API untuk domain saran dan arahan pimpinan.
 * Semua method melempar `ApiClientError` jika backend mengembalikan status non-2xx.
 */
export const adviceApi = {
  /**
   * Ambil daftar saran/arahan dengan paginasi dan filter.
   * @param filters - Filter dan paginasi (page, pageSize, search, status, operatorId)
   * @returns Promise berisi `data` (array advice) dan `meta` paginasi
   * @throws {ApiClientError} 400 jika parameter paginasi tidak valid, 403 jika tidak berhak
   */
  list(filters?: AdviceFilters) {
    const { page, pageSize, ...rest } = filters ?? {};
    return apiClient.get<PaginatedResponse<Advice>>("/advice", {
      page,
      pageSize,
      ...rest,
    });
  },

  /**
   * Ambil detail satu saran/arahan berdasarkan ID.
   * @param id - ID advice
   * @returns Promise berisi `data.advice`
   * @throws {ApiClientError} 404 jika tidak ditemukan, 403 jika tidak berhak
   */
  get(id: string) {
    return apiClient.get<ApiResponse<Advice>>(`/advice/${encodeURIComponent(id)}`);
  },

  /**
   * Buat saran/arahan baru.
   * @param input - Data advice baru
   * @returns Promise berisi `data.advice` yang dibuat
   * @throws {ApiClientError} 400 jika input tidak valid, 403 jika tidak berhak
   */
  create(input: CreateAdviceInput) {
    return apiClient.post<ApiResponse<Advice>>("/advice", input);
  },

  /**
   * Perbarui status saran/arahan.
   * @param id - ID advice
   * @param status - Status baru ("BELUM_DITINDAKLANJUTI" | "SUDAH_DITINDAKLANJUTI")
   * @returns Promise berisi `data.advice` yang diperbarui
   * @throws {ApiClientError} 400 jika status tidak valid, 404 jika tidak ditemukan, 403 jika tidak berhak
   */
  updateStatus(
    id: string,
    status: "BELUM_DITINDAKLANJUTI" | "SUDAH_DITINDAKLANJUTI",
  ) {
    return apiClient.patch<ApiResponse<Advice>>(`/advice/${encodeURIComponent(id)}`, { status });
  },

  /**
   * Hapus saran/arahan berdasarkan ID.
   * @param id - ID advice
   * @returns Promise berisi `data` advice yang dihapus
   * @throws {ApiClientError} 404 jika tidak ditemukan, 403 jika tidak berhak
   */
  remove(id: string) {
    return apiClient.delete<ApiResponse<Advice>>(`/advice/${encodeURIComponent(id)}`);
  },

  /**
   * Ambil daftar balasan saran/arahan.
   * @param id - ID advice
   * @returns Promise berisi array balasan
   */
  replies(id: string) { return apiClient.get<ApiResponse<unknown[]>>(`/advice/${encodeURIComponent(id)}/replies`); },

  /**
   * Buat balasan saran/arahan.
   * @param id - ID advice
   * @param isi - Isi balasan
   * @returns Promise berisi `data` balasan yang dibuat
   */
  reply(id: string, isi: string) { return apiClient.post<ApiResponse<unknown>>(`/advice/${encodeURIComponent(id)}/replies`, { isi }); },

  /**
   * Hapus balasan saran/arahan.
   * @param replyId - ID balasan
   * @returns Promise berisi `data` balasan yang dihapus
   */
  removeReply(replyId: string) { return apiClient.delete<ApiResponse<unknown>>(`/advice/replies/${encodeURIComponent(replyId)}`); },
};
