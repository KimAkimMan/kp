import { programProgressRepository } from "./program-progress.repository";
import { programRepository } from "./program.repository";
import { completeDirectUpload, presignDirectUpload, presignDownload, type DirectUploadInput } from "@/modules/storage/direct-upload.service";
import { ApiError } from "@/lib/http/api-error";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

export const programProgressService = {
  async list(programId: number, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat melihat progress.", 403);
    }
    return programProgressRepository.list(programId);
  },

  async verify(
    progressId: number,
    decision: "APPROVED" | "REJECTED",
    user: AuthenticatedUser,
    rejectionReason?: string,
  ) {
    if (user.role !== "ADMIN") {
      throw new ApiError("FORBIDDEN", "Hanya Admin yang dapat memverifikasi progres.", 403);
    }
    return programProgressRepository.verify(progressId, decision, user.id, rejectionReason);
  },

  async presignDirect(
    progressId: number,
    input: DirectUploadInput,
    user: AuthenticatedUser,
  ) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat mengunggah foto progres.", 403);
    }
    // progressId di sini sebenarnya programId (dari route /programs/[id]/progress).
    // Validasi program ada, bukan progress record (belum dibuat saat upload).
    const program = await programRepository.findById(progressId);
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
    return presignDirectUpload(`progress/${progressId}/photos`, input, "image");
  },

  async completeDirect(
    progressId: number,
    input: DirectUploadInput & { storageKey: string; caption?: string | null },
    user: AuthenticatedUser,
  ) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat mengunggah foto progres.", 403);
    }
    // Validasi progressId ada
    await programProgressRepository.findById(progressId);
    // Hanya verifikasi upload ke object storage. Penyimpanan storageKey ke database
    // dilakukan oleh addProgress setelah progress record dibuat.
    await completeDirectUpload(`progress/${progressId}/photos`, input, "image");
    return { storageKey: input.storageKey, originalName: input.originalName };
  },

  async download(progressId: number, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR" && user.role !== "PIMPINAN") {
      throw new ApiError("FORBIDDEN", "Hanya Admin, Operator, dan Pimpinan yang dapat melihat foto progres.", 403);
    }
    const photo = await programProgressRepository.findPhotoByProgressId(progressId);
    if (!photo) throw new ApiError("PROGRESS_PHOTO_NOT_FOUND", "Foto progres tidak ditemukan.", 404);
    // storageKey dan originalName disimpan sebagai daftar koma-separated (bisa banyak foto)
    const keys = (photo.storageKey ?? "").split(",").filter(Boolean);
    const names = (photo.originalName ?? "").split(",").filter(Boolean);
    const downloads = keys.map((key, idx) => ({
      storageKey: key,
      originalName: names[idx] ?? `foto-progres-${idx + 1}.jpg`,
      ...(presignDownload(key, names[idx] ?? `foto-progres-${idx + 1}.jpg`, "image/jpeg")),
    }));
    return { photo, downloads };
  },
};