import { programHistoryRepository } from "./program-history.repository";

export const programHistoryService = {
  async list(programId: number, user?: { role: string; id: number }) {
    return programHistoryRepository.list(programId, user);
  },
};