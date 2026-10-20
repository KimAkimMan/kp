import { programRepository } from "./program.repository";
import type { CreateProgramInput } from "./program.types";

export const programService = {
  list() {
    return programRepository.findMany();
  },

  create(input: CreateProgramInput) {
    return programRepository.create(input);
  },
};
