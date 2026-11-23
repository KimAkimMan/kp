import { programRepository } from "./program.repository";
import type { CreateProgramInput } from "./program.types";
import { ApiError } from "@/lib/http/api-error";
import type { ProgramListFilters, UpdateProgramInput } from "./program.types";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { ProgramActor } from "./program.types";
import { publicUserSelect } from "../auth/auth.repository";
import {
  presignDownload,
  type DirectUploadInput,
} from "@/modules/storage/direct-upload.service";

function toFlatProgram(program: {
  id: number;
  kode: string;
  nama: string;
  namaKegiatan: string | null;
  kategori: string;
  categoryId: number | null;
  periodId: number | null;
  lokasi: string;
  kecamatan: string | null;
  kecamatanId: number | null;
  desaKelurahan: string | null;
  villageId: number | null;
  detailLokasi: string | null;
  operatorPengelola: string | null;
  operatorPengelolaId: number | null;
  penyedia: string | null;
  direktur: string | null;
  noKontrak: string | null;
  nilaiKontrak: number | Prisma.Decimal | null;
  periode: string;
  satuan: string | null;
  target: number | Prisma.Decimal | null;
  targetAwal: number | Prisma.Decimal | null;
  targetVolume: number | Prisma.Decimal | null;
  realisasi: number | Prisma.Decimal | null;
  realisasiVolume: number | Prisma.Decimal | null;
  pagu: number | Prisma.Decimal | null;
  penggunaan: number | Prisma.Decimal | null;
  penggunaanBiaya: number | Prisma.Decimal | null;
  status: string;
  jadwal: string | null;
  lebarJalan: number | Prisma.Decimal | null;
  kondisiJalan: string | null;
  tanggalMulai: Date | null;
  tanggalSelesai: Date | null;
  catatan: string | null;
  sumber: string | null;
  update: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletedById: number | null;
  histories?: unknown[];
  costs?: unknown[];
  assignments?: unknown[];
  progressEntries?: unknown[];
  surveys?: unknown[];
  adviceRecords?: unknown[];
  operator?: { id: number; nama: string; email: string; role: string } | null;
} | null) {
  if (!program) return null;
  const { histories, costs, assignments, progressEntries, surveys, adviceRecords, operator, ...flat } = program;
  return {
    ...flat,
    operatorPengelola: program.operatorPengelola ?? null,
    operatorPengelolaId: program.operatorPengelolaId ?? null,
    operator: operator ? { id: operator.id, nama: operator.nama, email: operator.email, role: operator.role } : null,
  };
}

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
    status: string;
  } | null;
};

export const programService = {
  list(filters: ProgramListFilters = {}) {
    return programRepository.findMany(filters);
  },

  async create(input: CreateProgramInput, createdById: number) {
    const result = await programRepository.create({ ...input, createdById });
    if (!result.isDuplicate) {
      await prisma.auditLog.create({
        data: {
          userId: createdById,
          action: "CREATE",
          entity: "Program",
          entityId: String(result.program.id),
          details: { kode: input.kode, nama: input.nama },
        },
      });
    }
    return { program: toFlatProgram(result.program), created: !result.isDuplicate };
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
    return { program: toFlatProgram(program), created };
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
    return toFlatProgram(result);
  },

  async get(id: number, user?: AuthenticatedUser) {
    const program = await programRepository.findById(id);
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
    // Admin dan Pimpinan dapat melihat semua program. Operator hanya program miliknya.
    if (user?.role !== "ADMIN" && user?.role !== "PIMPINAN") {
      if (!user || program.operatorPengelolaId === null || program.operatorPengelolaId !== user.id) {
        throw new ApiError(
          "FORBIDDEN",
          "Anda tidak dapat melihat program yang bukan bajo pengelolaan Anda.",
          403,
        );
      }
      const { surveys, adviceRecords, ...rest } = program;
      return toFlatProgram(rest);
    }
    return toFlatProgram(program);
  },

  async update(id: number, input: UpdateProgramInput, user: AuthenticatedUser) {
    await this.get(id, user);
    // Blokir field yang hanya boleh diubah melalui alur khusus (bukan PATCH langsung)
    const BLOCKED_FIELDS = new Set(["realisasi", "realisasiVolume", "penggunaan", "penggunaanBiaya", "status"]);
    const inputRecord = input as Record<string, unknown>;
    const blocked = Object.keys(inputRecord).filter((k) => BLOCKED_FIELDS.has(k) && inputRecord[k] !== undefined);
    if (blocked.length > 0) {
      throw new ApiError(
        "FORBIDDEN",
        `Field ${blocked.join(", ")} tidak dapat diubah lewat PATCH. Gunakan endpoint yang sesuai (progress, cost, complete).`,
        403,
      );
    }
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
      // Operator hanya boleh mengubah field teknis/jadwal, bukan angka keuangan
      const OPERATOR_ALLOWED = new Set([
        "nama", "namaKegiatan", "kategori", "lokasi", "kecamatan", "desaKelurahan",
        "detailLokasi", "satuan", "target", "targetAwal", "targetVolume",
        "penyedia", "direktur", "noKontrak", "jadwal",
        "lebarJalan", "kondisiJalan", "tanggalMulai", "tanggalSelesai",
        "catatan", "sumber", "update", "status",
        "pagu", "nilaiKontrak",
      ]);
      const inputRecord = input as Record<string, unknown>;
      const forbidden = Object.keys(inputRecord).filter((k) => !OPERATOR_ALLOWED.has(k) && inputRecord[k] !== undefined);
      if (forbidden.length > 0) {
        throw new ApiError("FORBIDDEN", "Operator tidak dapat mengubah field: " + forbidden.join(", "), 403);
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
    return toFlatProgram(result);
  },

  async assertCanEdit(id: number, user: AuthenticatedUser) {
    const program = await this.get(id, user);
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
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
    await this.get(id, { id: deletedById, role: "ADMIN" } as AuthenticatedUser);
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
    // Ambil program lengkap setelah delete untuk return konsisten (flat ApiProgram)
    const deleted = await prisma.program.findUnique({
      where: { id },
      include: {
        operator: { select: publicUserSelect },
        histories: true,
        costs: true,
        assignments: true,
        progressEntries: true,
        surveys: true,
        adviceRecords: true,
      },
    });
    return toFlatProgram(deleted ?? { id, deletedAt: result.deletedAt } as unknown as NonNullable<Parameters<typeof toFlatProgram>[0]>);
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