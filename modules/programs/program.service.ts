import { programRepository } from "./program.repository";
import type { CreateProgramInput } from "./program.types";
import { ApiError } from "@/lib/http/api-error";
import type { ProgramListFilters, UpdateProgramInput } from "./program.types";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { prisma } from "@/lib/prisma";
import type { ProgramActor } from "./program.types";
import {
  presignDownload,
  type DirectUploadInput,
} from "@/modules/storage/direct-upload.service";

export type DocumentationPhoto = {
  id: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  caption?: string | null;
  surveyId: string;
  createdAt: string;
  downloadUrl: string;
  program: {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
    lokasi: string;
  } | null;
};

export const programService = {
  list(filters: ProgramListFilters = {}) {
    return programRepository.findMany(filters);
  },

  async create(input: CreateProgramInput, createdById: number) {
    const result = await programRepository.create({ ...input, createdById });
    await prisma.auditLog.create({
      data: {
        userId: createdById,
        action: "CREATE",
        entity: "Program",
        entityId: String(result.id),
        details: { kode: input.kode, nama: input.nama },
      },
    });
    return result;
  },

  async upsert(input: CreateProgramInput, createdById: number) {
    const { program, created } = await programRepository.upsertByKode(
      input,
      createdById,
    );
    await prisma.auditLog.create({
      data: {
        userId: createdById,
        action: created ? "CREATE" : "UPDATE",
        entity: "Program",
        entityId: String(program.id),
        details: { kode: input.kode, nama: input.nama, created },
      },
    });
    return { program, created };
  },

  async claim(id: number, user: ProgramActor) {
    if (user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya operator yang dapat mengambil program.", 403);
    }
    const result = await programRepository.claim(id, user.id, user.nama, user.id);
    if (result === null) {
      throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
    }
    if (result === false) {
      throw new ApiError("PROGRAM_ALREADY_ASSIGNED", "Kegiatan telah diambil operator lain.", 409);
    }
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CLAIM",
        entity: "Program",
        entityId: String(id),
        details: { operatorId: user.id, operatorNama: user.nama },
      },
    });
    return result;
  },

  async get(id: number) {
    const program = await programRepository.findById(id);
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
    return program;
  },

  async update(id: number, input: UpdateProgramInput, user: AuthenticatedUser) {
    await this.get(id);
    if (user.role === "OPERATOR") {
      if (
        input.operatorPengelolaId !== undefined &&
        input.operatorPengelolaId !== user.id
      ) {
        throw new ApiError("FORBIDDEN", "Operator tidak dapat mengubah penugasan program.", 403);
      }
      if (input.status === "SELESAI_DIKERJAKAN") {
        throw new ApiError("USE_COMPLETE_ACTION", "Gunakan action complete untuk menyelesaikan program.", 409);
      }
    }
    const result = await programRepository.update(id, input);
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entity: "Program",
        entityId: String(id),
        details: input,
      },
    });
    return result;
  },

  async assertCanEdit(id: number, user: AuthenticatedUser) {
    const program = await this.get(id);
    if (user.role === "ADMIN") return program;
    if (user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Anda tidak dapat mengubah program ini.", 403);
    }
    if (program.operatorPengelolaId === null) {
      throw new ApiError("PROGRAM_NOT_ASSIGNED", "Claim program terlebih dahulu.", 409);
    }
    if (program.operatorPengelolaId !== user.id) {
      throw new ApiError("FORBIDDEN", "Anda tidak dapat mengubah program ini.", 403);
    }
    return program;
  },

  async remove(id: number, deletedById: number) {
    await this.get(id);
    const result = await programRepository.delete(id, deletedById);
    await prisma.auditLog.create({
      data: {
        userId: deletedById,
        action: "DELETE",
        entity: "Program",
        entityId: String(id),
        details: { reason: "API admin delete" },
      },
    });
    return result;
  },

  async getDocumentationPhotos() {
    const photos = await programRepository.findDocumentationPhotos();

    // Generate presigned download URL dari object storage (R2) untuk setiap foto,
    // sehingga dapat ditampilkan di halaman publik tanpa autentikasi.
    const result: DocumentationPhoto[] = [];
    for (const photo of photos) {
      const { downloadUrl } = await presignDownload(
        photo.storageKey,
        photo.originalName,
        photo.mimeType,
      );
      result.push({
        ...photo,
        createdAt: photo.createdAt.toISOString(),
        downloadUrl,
        program: photo.program ?? null,
      });
    }
    return result;
  },
};
