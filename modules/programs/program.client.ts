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
  create(input: CreateProgramInput, options?: { idempotencyKey?: string }) {
    return apiClient.post<ApiResponse<ApiProgram>>("/programs", input, options);
  },
  /** Membuat program baru atau memperbarui yang sudah ada berdasarkan `kode`. */
  upsert(
    input: CreateProgramInput,
    options?: { idempotencyKey?: string },
  ) {
    return apiClient.put<ApiResponse<ApiProgram>>(
      "/programs",
      input,
      options,
    );
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
  /** Menambahkan laporan progres pada program dengan opsional upload foto ke object storage. */
  async addProgress(
    id: number,
    input: CreateProgressInput,
    photoFiles?: File[],
  ) {
    const storageKeys: string[] = [];
    const originalNames: string[] = [];

    // Jika ada file foto, upload setiap file langsung ke object storage
    if (photoFiles && photoFiles.length > 0) {
      for (const photoFile of photoFiles) {
        // 1. Minta presigned upload URL dari server (gabungan di route progress)
        const presigned = await apiClient.post<ApiResponse<{
          uploadUrl: string;
          storageKey: string;
          expiresAt: string;
          expiresInSeconds: number;
          contentType: string;
        }>>(
          `/programs/${id}/progress`,
          { action: "presign", originalName: photoFile.name, mimeType: photoFile.type, fileSize: photoFile.size },
        );
        const { uploadUrl: presignedUrl, storageKey: sk } = presigned.data;
        storageKeys.push(sk);
        originalNames.push(photoFile.name);

        // 2. Upload file langsung ke object storage (bypass server)
        try {
          const putResponse = await fetch(presignedUrl, {
            method: "PUT",
            body: photoFile,
            headers: { "Content-Type": photoFile.type },
          });
          if (!putResponse.ok) {
            const text = await putResponse.text().catch(() => "");
            throw new Error(`Object storage PUT gagal (${putResponse.status}): ${text}`);
          }
        } catch (err) {
          throw new Error(`Gagal mengupload foto progres ke object storage: ${err instanceof Error ? err.message : String(err)}`);
        }

        // 3. Beri tahu server bahwa upload selesai (gabungan di route progress)
        await apiClient.post<ApiResponse<unknown>>(
          `/programs/${id}/progress`,
          {
            action: "complete",
            storageKey: sk,
            originalName: photoFile.name,
            mimeType: photoFile.type,
            fileSize: photoFile.size,
          },
        );
      }
    }

    return apiClient.post<ApiResponse<unknown>>(`/programs/${id}/progress`, {
      ...input,
      storageKey: storageKeys.length > 0 ? storageKeys.join(",") : null,
      originalName: originalNames.length > 0 ? originalNames.join(",") : null,
    });
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
  /** Ambil URL unduhan foto progres (presigned download URL). */
  progressPhoto(progressId: number) {
    return apiClient.get<ApiResponse<{ photo: { id: number; storageKey: string; originalName: string | null; tahap: string; tanggal: string }; downloadUrl: string; expiresAt: string; expiresInSeconds: number }>>(
      `/programs/progress/photos/${encodeURIComponent(String(progressId))}/download`,
    );
  },
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
  /** Mengunggah dokumen bukti biaya ke object storage langsung (bypass server). */
  async uploadCostDocument(costId: number, file: File) {
    // 1. Minta presigned upload URL dari server
    const presigned = await apiClient.post<ApiResponse<{
      uploadUrl: string;
      storageKey: string;
      expiresAt: string;
      expiresInSeconds: number;
      contentType: string;
    }>>(
      `/costs/${costId}/documents/presign`,
      { originalName: file.name, mimeType: file.type, fileSize: file.size },
    );
    const { uploadUrl, storageKey } = presigned.data;

    // 2. Upload file langsung ke object storage (bypass server)
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    // 3. Beri tahu server bahwa upload selesai
    return apiClient.post<ApiResponse<unknown>>(
      `/costs/${costId}/documents/complete`,
      { storageKey, originalName: file.name, mimeType: file.type, fileSize: file.size },
    );
  },
  /** Menghapus dokumen bukti biaya berdasarkan ID dokumen. */
  removeCostDocument(costId: number, documentId: string) { return apiClient.delete<ApiResponse<unknown>>(`/costs/${costId}/documents/${encodeURIComponent(documentId)}`); },
};

export type { ConvertSurveyInput, DocumentationPhoto };
