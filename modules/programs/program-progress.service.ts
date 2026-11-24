import { programProgressRepository } from "./program-progress.repository";
import { programRepository } from "./program.repository";
import { completeDirectUpload, presignDirectUpload, presignDownload, type DirectUploadInput } from "@/modules/storage/direct-upload.service";
import { ApiError } from "@/lib/http/api-error";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { prisma } from "@/lib/prisma";

export const programProgressService = {
  async list(programId: number, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat melihat progress.", 403);
    }
    // Operator hanya dapat melihat progress program yang dikelolanya.
    if (user.role === "OPERATOR") {
      const program = await programRepository.findById(programId);
      if (!program || program.operatorPengelolaId !== user.id) {
        throw new ApiError("FORBIDDEN", "Anda tidak dapat melihat progress program ini.", 403);
      }
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
    if (user.role === "OPERATOR" && program.operatorPengelolaId !== user.id) {
      throw new ApiError("FORBIDDEN", "Anda tidak dapat mengunggah foto progres program operator lain.", 403);
    }
    return presignDirectUpload(`progress/${progressId}/photos`, input, "image");
  },

  async completeDirect(
    programId: number,
    input: DirectUploadInput & { storageKey: string; caption?: string | null },
    user: AuthenticatedUser,
  ) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat mengunggah foto progres.", 403);
    }
    // Validasi programId ada (progress record belum dibuat saat upload foto presigned)
    const program = await programRepository.findById(programId);
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
    if (user.role === "OPERATOR" && program.operatorPengelolaId !== user.id) {
      throw new ApiError("FORBIDDEN", "Anda tidak dapat mengunggah foto progres program operator lain.", 403);
    }
    // Hanya verifikasi upload ke object storage.
    await completeDirectUpload(`progress/${programId}/photos`, input, "image");
    // Simpan storageKey ke database sebagai progress record agar tidak hilang
    // jika addProgress tidak segera dipanggil setelahnya.
    await prisma.programProgress.create({
      data: {
        programId,
        tanggal: new Date(),
        tahap: input.caption ?? "Upload foto progres",
        volume: 0,
        satuan: program.satuan ?? "Unit",
        persentase: null,
        keterangan: input.caption ?? "",
        reportedById: user.id,
        status: "DRAFT",
        storageKey: input.storageKey,
        originalName: input.originalName,
      },
    });
    return { storageKey: input.storageKey, originalName: input.originalName };
  },

  async download(progressId: number, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR" && user.role !== "PIMPINAN") {
      throw new ApiError("FORBIDDEN", "Hanya Admin, Operator, dan Pimpinan yang dapat melihat foto progres.", 403);
    }
    const photo = await programProgressRepository.findPhotoByProgressId(progressId);
    if (!photo) throw new ApiError("PROGRESS_PHOTO_NOT_FOUND", "Foto progres tidak ditemukan.", 404);
    // Operator hanya boleh download foto program yang dia kelola
    if (user.role === "OPERATOR") {
      const progress = await programProgressRepository.findById(progressId);
      if (progress.program.operatorPengelolaId !== user.id) {
        throw new ApiError("FORBIDDEN", "Anda tidak dapat mengakses foto progres program ini.", 403);
      }
    }
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