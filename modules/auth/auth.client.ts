import { apiClient, type ApiResponse } from "@/lib/api/client";
import type { ApiUser, AuthData } from "@/lib/api/types";

/**
 * Klien API untuk domain autentikasi dan session.
 * Semua method melempar `ApiClientError` jika backend mengembalikan status non-2xx.
 */
export const authApi = {
  /**
   * Login dengan email dan kata sandi. Setelah sukses, cookie `kp_session`
   * akan disimpan oleh backend dan otomatis dikirim pada request berikutnya.
   * @param input - Kredensial login (email dan password)
   * @returns Promise berisi `data.accessToken`, `data.user`, dan `data.expiresAt`
   * @throws {ApiClientError} 400 jika payload tidak valid, 401 jika kredensial salah, 429 jika rate-limited
   */
  login(input: { email: string; password: string }) {
    return apiClient.post<ApiResponse<AuthData>>("/auth/login", input);
  },

  /**
   * Logout sesi pengguna saat ini dan menghapus cookie `kp_session`.
   * @returns Promise yang resolved saat logout sukses
   * @throws {ApiClientError} 401 jika tidak terautentikasi
   */
  logout() {
    return apiClient.post<ApiResponse<null>>("/auth/logout");
  },

  /**
   * Perbarui profil pengguna (nama dan/atau email).
   * @param input - Field yang ingin diperbarui (nama dan/atau email)
   * @returns Promise berisi `data.user` yang sudah diperbarui
   * @throws {ApiClientError} 400 jika input tidak valid, 401 jika tidak terautentikasi
   */
  updateProfile(input: { nama?: string; email?: string }) {
    return apiClient.patch<ApiResponse<ApiUser>>("/auth/profile", input);
  },

  /**
   * Ganti kata sandi pengguna.
   * @param input - Kata sandi saat ini dan kata sandi baru
   * @returns Promise berisi `data.changed` (true jika sukses)
   * @throws {ApiClientError} 400 jika input tidak valid, 401 jika kata sandi saat ini salah
   */
  changePassword(input: { currentPassword: string; newPassword: string }) {
    return apiClient.post<ApiResponse<{ changed: true }>>("/auth/change-password", input);
  },

  /**
   * Ambil data pengguna yang sedang login (dari cookie sesi).
   * @returns Promise berisi `data.user`
   * @throws {ApiClientError} 401 jika tidak terautentikasi atau sesi expired
   */
  me() {
    return apiClient.get<ApiResponse<ApiUser>>("/auth/me");
  },
};
