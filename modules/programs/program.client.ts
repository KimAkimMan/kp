import { apiClient, type ApiResponse, type PaginatedResponse } from "@/lib/api/client";
import type {
  ApiProgram,
  CreateCostInput,
  CreateProgressInput,
  ProgramFilters,
  ConvertSurveyInput,
  CreateProgramInput,
  UpdateProgramInput,
  PublicProgram,
  PublicProgramFilters,
} from "@/lib/api/types";
import type { DocumentationPhoto } from "./program.service";

/**
 * Klien API untuk domain program dan kegiatan.
 * Semua method melempar `ApiClientError` jika backend mengembalikan status non-2xx.
 */
export const programApi = {
  /** Mengambil daftar program beserta metadata pagination. */
  list(filters?: ProgramFilters) {
    return apiClient.get<PaginatedResponse<ApiProgram>>("/programs", filters);
  },
  /** Mengambil detail satu program berdasarkan ID. */
  get(id: number) {
    return apiClient.get<ApiResponse<ApiProgram>>(`/programs/${id}`);
  },
  /** Membuat program baru. */
  create(input: CreateProgramInput) {
    return apiClient.post<ApiResponse<ApiProgram>>("/programs", input);
  },
  /** Memperbarui data atau status program berdasarkan ID. */
  update(id: number, input: UpdateProgramInput) {
    return apiClient.patch<ApiResponse<ApiProgram>>(`/programs/${id}`, input);
  },
  /** Menghapus atau menonaktifkan program berdasarkan ID. */
  remove(id: number) {
    return apiClient.delete<ApiResponse<ApiProgram>>(`/programs/${id}`);
  },
  /** Mengambil daftar program publik beserta metadata pagination. */
  public(filters?: PublicProgramFilters) {
    return apiClient.get<PaginatedResponse<PublicProgram>>("/public/programs", filters);
  },
  /** Mengambil daftar foto dokumentasi publik. */
  documentation() {
    return apiClient.get<{ data: DocumentationPhoto[] }>("/public/documentation");
  },
  /** Mengklaim program untuk operator yang sedang login. */
  claim(id: number) {
    return apiClient.post<ApiResponse<ApiProgram>>(`/programs/${id}/claim`);
  },
  /** Menambahkan laporan progres pada program. */
  addProgress(id: number, input: CreateProgressInput) {
    return apiClient.post<ApiResponse<unknown>>(`/programs/${id}/progress`, input);
  },
  /** Menambahkan biaya pada program. */
  addCost(id: number, input: CreateCostInput) {
    return apiClient.post<ApiResponse<unknown>>(`/programs/${id}/costs`, input);
  },
  /** Menyelesaikan program dengan opsi bukti foto. */
  complete(id: number, input?: { foto?: boolean }) {
    return apiClient.post<ApiResponse<ApiProgram>>(`/programs/${id}/complete`, input);
  },
  /** Mengambil riwayat perubahan program. */
  history(id: number) { return apiClient.get<ApiResponse<unknown[]>>(`/programs/${id}/history`); },
  /** Mengambil daftar progres program. */
  progress(id: number) { return apiClient.get<ApiResponse<unknown[]>>(`/programs/${id}/progress`); },
  /** Mengambil daftar biaya program. */
  costs(id: number) { return apiClient.get<ApiResponse<unknown[]>>(`/programs/${id}/costs`); },
  /** Mengambil penugasan operator untuk program. */
  assignments(id: number) { return apiClient.get<ApiResponse<unknown[]>>(`/programs/${id}/assignments`); },
  /** Menugaskan operator pada program beserta catatan penugasan. */
  assign(id: number, input: { operatorId: number; notes?: string }) { return apiClient.post<ApiResponse<unknown>>(`/programs/${id}/assignments`, input); },
  /** Menerima penugasan operator pada program. */
  acceptAssignment(programId: number, assignmentId: number) { return apiClient.post<ApiResponse<unknown>>(`/programs/${programId}/assignments/${assignmentId}`); },
  /** Membebaskan penugasan operator dari program. */
  releaseAssignment(programId: number, assignmentId: number) { return apiClient.patch<ApiResponse<unknown>>(`/programs/${programId}/assignments/${assignmentId}`, { action: "release" }); },
  /** Menghapus penugasan operator dari program. */
  removeAssignment(programId: number, assignmentId: number) { return apiClient.delete<ApiResponse<unknown>>(`/programs/${programId}/assignments/${assignmentId}`); },
  /** Memverifikasi atau menolak laporan progres. */
  verifyProgress(id: number, input: { decision: "APPROVED" | "REJECTED"; rejectionReason?: string }) { return apiClient.patch<ApiResponse<unknown>>(`/progress/${id}/verify`, input); },
  /** Memverifikasi atau menolak laporan biaya. */
  verifyCost(id: number, input: { decision: "APPROVED" | "REJECTED"; rejectionReason?: string }) { return apiClient.patch<ApiResponse<unknown>>(`/costs/${id}`, input); },
  /** Mengambil daftar dokumen bukti biaya. */
  costDocuments(costId: number) { return apiClient.get<ApiResponse<unknown[]>>(`/costs/${costId}`); },
  /** Mengunggah dokumen bukti biaya melalui multipart form. */
  uploadCostDocument(costId: number, file: File) { const body = new FormData(); body.append("file", file); return apiClient.request<ApiResponse<unknown>>(`/costs/${costId}`, { method: "POST", body }); },
  /** Menghapus dokumen bukti biaya berdasarkan ID dokumen. */
  removeCostDocument(costId: number, documentId: string) { return apiClient.delete<ApiResponse<unknown>>(`/costs/${costId}/documents/${encodeURIComponent(documentId)}`); },
};

export type { ConvertSurveyInput, DocumentationPhoto };
