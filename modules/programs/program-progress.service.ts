import { programProgressRepository } from "./program-progress.repository";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

export const programProgressService = {
  async list(programId: number, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat melihat progress.");
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
      throw new Error("Hanya Admin yang dapat memverifikasi progress.");
    }
    return programProgressRepository.verify(progressId, decision, user.id, rejectionReason);
  },
};