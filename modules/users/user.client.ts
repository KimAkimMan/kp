import { apiClient, type ApiResponse, type PaginatedResponse } from "@/lib/api/client";
import type { ApiUser, UserFilters, CreateUserInput, UpdateUserInput } from "@/lib/api/types";

/**
 * Klien API untuk domain manajemen pengguna.
 * Semua method melempar `ApiClientError` jika backend mengembalikan status non-2xx.
 */
export const userApi = {
  /**
   * Ambil daftar pengguna dengan paginasi dan filter.
   * @param filters - Filter dan paginasi (page, pageSize, search, role)
   * @returns Promise berisi `data` (array pengguna) dan `meta` paginasi
   * @throws {ApiClientError} 400 jika parameter paginasi tidak valid, 403 jika tidak berhak
   */
  list(filters?: UserFilters) {
    const { page, pageSize, ...rest } = filters ?? {};
    return apiClient.get<PaginatedResponse<ApiUser>>("/users", {
      page,
      pageSize,
      ...rest,
    });
  },

  /**
   * Ambil detail satu pengguna berdasarkan ID.
   * @param id - ID pengguna
   * @returns Promise berisi `data.user`
   * @throws {ApiClientError} 404 jika pengguna tidak ditemukan, 403 jika tidak berhak
   */
  get(id: number) {
    return apiClient.get<ApiResponse<ApiUser>>(`/users/${id}`);
  },

  /**
   * Buat pengguna baru.
   * @param input - Data pengguna baru
   * @returns Promise berisi `data.user` yang dibuat
   * @throws {ApiClientError} 400 jika input tidak valid, 409 jika email duplikat, 403 jika tidak berhak
   */
  create(input: CreateUserInput) {
    return apiClient.post<ApiResponse<ApiUser>>("/users", input);
  },

  /**
   * Perbarui data pengguna berdasarkan ID.
   * @param id - ID pengguna
   * @param input - Field yang ingin diperbarui
   * @returns Promise berisi `data.user` yang diperbarui
   * @throws {ApiClientError} 400 jika input tidak valid, 404 jika tidak ditemukan, 403 jika tidak berhak
   */
  update(id: number, input: UpdateUserInput) {
    return apiClient.patch<ApiResponse<ApiUser>>(`/users/${id}`, input);
  },

  /**
   * Hapus pengguna berdasarkan ID.
   * @param id - ID pengguna
   * @returns Promise berisi `data` yang terhapus
   * @throws {ApiClientError} 404 jika tidak ditemukan, 403 jika tidak berhak
   */
  remove(id: number) {
    return apiClient.delete<ApiResponse<ApiUser>>(`/users/${id}`);
  },

  /**
   * Reset kata sandi pengguna.
   * @param id - ID pengguna
   * @param password - Kata sandi baru
   * @returns Promise berisi `data.reset` (true jika sukses)
   * @throws {ApiClientError} 400 jika kata sandi tidak valid, 404 jika tidak ditemukan, 403 jika tidak berhak
   */
  resetPassword(id: number, password: string) {
    return apiClient.post<ApiResponse<{ reset: true }>>(`/users/${id}/reset-password`, { password });
  },
};
