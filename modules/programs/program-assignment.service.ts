import { programAssignmentRepository } from "./program-assignment.repository";
import type { ProgramAssignmentInput, ProgramAssignmentUpdateInput } from "./program-assignment.repository";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

export const programAssignmentService = {
  async list(programId: number, user: AuthenticatedUser) {
    // Hanya Admin dan Operator yang dapat melihat assignment
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat melihat assignment.");
    }
    return programAssignmentRepository.list(programId);
  },

  async create(programId: number, input: ProgramAssignmentInput, user: AuthenticatedUser) {
    if (user.role !== "ADMIN") {
      throw new Error("Hanya Admin yang dapat menugaskan operator.");
    }
    return programAssignmentRepository.create(programId, {
      ...input,
      assignedById: user.id,
    });
  },

  async accept(assignmentId: number, operatorId: number) {
    return programAssignmentRepository.accept(assignmentId, operatorId);
  },

  async release(assignmentId: number, operatorId: number, isAdmin: boolean) {
    return programAssignmentRepository.release(assignmentId, operatorId, isAdmin);
  },

  async update(assignmentId: number, input: ProgramAssignmentUpdateInput, user: AuthenticatedUser) {
    if (user.role !== "ADMIN") {
      throw new Error("Hanya Admin yang dapat mengubah assignment.");
    }
    return programAssignmentRepository.update(assignmentId, input);
  },

  async delete(assignmentId: number, user: AuthenticatedUser) {
    if (user.role !== "ADMIN") {
      throw new Error("Hanya Admin yang dapat menghapus assignment.");
    }
    return programAssignmentRepository.delete(assignmentId);
  },
};