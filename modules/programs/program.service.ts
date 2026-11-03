import { programRepository } from "./program.repository";
import type { CreateProgramInput } from "./program.types";
import { ApiError } from "@/lib/http/api-error";
import type { ProgramListFilters, UpdateProgramInput } from "./program.types";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { prisma } from "@/lib/prisma";
import type { ProgramActor } from "./program.types";

export const programService = {
  list(filters: ProgramListFilters = {}) {
    return programRepository.findMany(filters);
  },

  create(input: CreateProgramInput, createdById: number) {
    return programRepository.create({ ...input, createdById });
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
    return programRepository.update(id, input);
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
};
