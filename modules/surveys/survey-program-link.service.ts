import { surveyProgramLinkRepositoryWithSurvey } from "./survey-program-link.repository";
import type { SurveyProgramLinkInput } from "./survey-program-link.repository";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

export const surveyProgramLinkService = {
  async list(surveyId: string, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat melihat link survey.");
    }
    return surveyProgramLinkRepositoryWithSurvey.list(surveyId);
  },

  async create(
    surveyId: string,
    input: Omit<SurveyProgramLinkInput, "surveyId">,
    user: AuthenticatedUser,
  ) {
    if (user.role !== "ADMIN") {
      throw new Error("Hanya Admin yang dapat link survey ke program.");
    }
    return surveyProgramLinkRepositoryWithSurvey.create(surveyId, {
      ...input,
      linkedById: user.id,
    });
  },

  async delete(linkId: string, user: AuthenticatedUser) {
    if (user.role !== "ADMIN") {
      throw new Error("Hanya Admin yang dapat menghapus link.");
    }
    return surveyProgramLinkRepositoryWithSurvey.delete(linkId);
  },
};