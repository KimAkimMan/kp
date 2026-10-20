import { adviceRepository } from "./advice.repository";

export const adviceService = {
  list() {
    return adviceRepository.findMany();
  },
};
