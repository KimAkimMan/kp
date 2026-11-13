import { programHistoryRepository } from "./program-history.repository";

export const programHistoryService = {
  async list(programId: number) {
    return programHistoryRepository.list(programId);
  },
};