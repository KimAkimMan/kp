import { surveyRepository } from "./survey.repository";

export const surveyService = {
  list() {
    return surveyRepository.findMany();
  },
};
