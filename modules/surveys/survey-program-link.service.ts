import { surveyProgramLinkRepositoryWithSurvey } from "./survey-program-link.repository";
import type { SurveyProgramLinkInput } from "./survey-program-link.repository";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { ApiError } from "@/lib/http/api-error";

export const surveyProgramLinkService = {
  async list(surveyId: string, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat melihat link survey.", 403);
    }
    return surveyProgramLinkRepositoryWithSurvey.list(surveyId);
  },

  async create(
    surveyId: string,
    input: Omit<SurveyProgramLinkInput, "surveyId">,
    user: AuthenticatedUser,
  ) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat link survey ke program.", 403);
    }
    return surveyProgramLinkRepositoryWithSurvey.create(surveyId, {
      ...input,
      linkedById: user.id,
    });
  },

  async delete(linkId: string, user: AuthenticatedUser) {
    if (user.role !== "ADMIN") {
      throw new ApiError("FORBIDDEN", "Hanya Admin yang dapat menghapus link.", 403);
    }
    return surveyProgramLinkRepositoryWithSurvey.delete(linkId);
  },
};