import { surveyProgramLinkRepositoryWithSurvey } from "./survey-program-link.repository";
import type { SurveyProgramLinkInput } from "./survey-program-link.repository";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { ApiError } from "@/lib/http/api-error";
import { prisma } from "@/lib/prisma";

export const surveyProgramLinkService = {
  async list(surveyId: string, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new ApiError("FORBIDDEN", "Hanya Admin dan Operator yang dapat melihat link survey.", 403);
    }
    // Operator hanya dapat melihat link survey yang dia kelola.
    if (user.role === "OPERATOR") {
      const survey = await prisma.fieldSurvey.findFirst({
        where: { id: surveyId, deletedAt: null },
        select: { id: true, surveyorId: true },
      });
      if (!survey || survey.surveyorId !== user.id) {
        throw new ApiError("FORBIDDEN", "Anda tidak dapat melihat link survey ini.", 403);
      }
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
    // Operator hanya dapat membuat link untuk survey yang dia kelola.
    if (user.role === "OPERATOR") {
      const survey = await prisma.fieldSurvey.findFirst({
        where: { id: surveyId, deletedAt: null },
        select: { id: true, surveyorId: true },
      });
      if (!survey || survey.surveyorId !== user.id) {
        throw new ApiError("FORBIDDEN", "Anda tidak dapat membuat link untuk survey ini.", 403);
      }
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