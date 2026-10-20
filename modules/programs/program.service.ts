import { programRepository } from "./program.repository";
import type { CreateProgramInput } from "./program.types";
import { ApiError } from "@/lib/http/api-error";
import type { ProgramListFilters, UpdateProgramInput } from "./program.types";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

export const programService = {
  list(filters: ProgramListFilters = {}) {
    return programRepository.findMany(filters);
  },

  create(input: CreateProgramInput) {
    return programRepository.create(input);
  },

  async get(id: number) {
    const program = await programRepository.findById(id);
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);
    return program;
  },

  async update(id: number, input: UpdateProgramInput) {
    await this.get(id);
    return programRepository.update(id, input);
  },

  async assertCanEdit(id: number, user: AuthenticatedUser) {
    const program = await this.get(id);
    if (user.role === "ADMIN") return program;
    if (
      user.role !== "OPERATOR" ||
      (program.operatorPengelolaId !== null &&
        program.operatorPengelolaId !== user.id)
    ) {
      throw new ApiError("FORBIDDEN", "Anda tidak dapat mengubah program ini.", 403);
    }
    return program;
  },

  async remove(id: number) {
    await this.get(id);
    return programRepository.delete(id);
  },
};
