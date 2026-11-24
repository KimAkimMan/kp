import { programAssignmentRepository } from "./program-assignment.repository";
import type { ProgramAssignmentInput, ProgramAssignmentUpdateInput } from "./program-assignment.repository";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { ApiError } from "@/lib/http/api-error";

export const programAssignmentService = {
  async list(programId: number, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat melihat assignment.", 403);
    }
    if (user.role === "OPERATOR") {
      const program = await programAssignmentRepository.findProgramOwner(programId);
      if (!program || program.operatorPengelolaId !== user.id) {
        throw new ApiError("FORBIDDEN", "Anda tidak dapat melihat assignment program ini.", 403);
      }
    }
    return programAssignmentRepository.list(programId);
  },

  async create(programId: number, input: ProgramAssignmentInput, user: AuthenticatedUser) {
    if (user.role !== "ADMIN") {
      throw new ApiError("FORBIDDEN", "Hanya Admin yang dapat menugaskan operator.", 403);
    }
    return programAssignmentRepository.create(programId, {
      ...input,
      assignedById: user.id,
    });
  },

  async accept(assignmentId: number, operatorId: number) {
    return programAssignmentRepository.accept(assignmentId, operatorId);
  },

  async release(assignmentId: number, operatorId: number, isAdmin: boolean, programId?: number) {
    return programAssignmentRepository.release(assignmentId, operatorId, isAdmin, programId);
  },

  async update(assignmentId: number, input: ProgramAssignmentUpdateInput, user: AuthenticatedUser) {
    if (user.role !== "ADMIN") {
      throw new ApiError("FORBIDDEN", "Hanya Admin yang dapat mengubah assignment.", 403);
    }
    return programAssignmentRepository.update(assignmentId, input);
  },

  async delete(assignmentId: number, user: AuthenticatedUser, programId?: number) {
    if (user.role !== "ADMIN") {
      throw new ApiError("FORBIDDEN", "Hanya Admin yang dapat menghapus assignment.", 403);
    }
    return programAssignmentRepository.delete(assignmentId, programId);
  },
};