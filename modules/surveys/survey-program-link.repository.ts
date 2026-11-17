import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http/api-error";

export type SurveyProgramLinkInput = {
  programId: number;
  linkedById?: number;
  relationType?: string;
};

export const surveyProgramLinkRepository = {
  async list(surveyId: string) {
    const survey = await prisma.fieldSurvey.findFirst({
      where: { id: surveyId, deletedAt: null },
      select: { id: true },
    });
    if (!survey) throw new ApiError("SURVEY_NOT_FOUND", "Survey tidak ditemukan.", 404);

    return prisma.surveyProgramLink.findMany({
      where: { surveyId },
      include: {
        program: true,
        linkedBy: { select: { id: true, nama: true, role: true } },
      },
      orderBy: { linkedAt: "desc" },
    });
  },

  async create(input: SurveyProgramLinkInput) {
    const survey = await prisma.fieldSurvey.findFirst({
      where: { id: input.programId.toString(), deletedAt: null },
    });
    // Cek survey exists by surveyId (dipanggil dari route dengan surveyId terpisah)
    // programId adalah program yang akan di-link

    const program = await prisma.program.findFirst({
      where: { id: input.programId, deletedAt: null },
    });
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);

    // Cek apakah sudah ada link
    const existing = await prisma.surveyProgramLink.findFirst({
      where: {
        surveyId: "", // Akan di-override oleh caller
        programId: input.programId,
      },
    });

    return prisma.surveyProgramLink.create({
      data: {
        surveyId: "", // Placeholder, akan diisi oleh caller
        programId: input.programId,
        linkedById: input.linkedById,
        relationType: input.relationType ?? "LINKED",
        linkedAt: new Date(),
      },
      include: {
        program: true,
        linkedBy: { select: { id: true, nama: true, role: true } },
      },
    });
  },

  async delete(linkId: string) {
    const link = await prisma.surveyProgramLink.findUnique({
      where: { id: linkId },
    });
    if (!link) throw new ApiError("LINK_NOT_FOUND", "Link tidak ditemukan.", 404);

    return prisma.surveyProgramLink.delete({ where: { id: linkId } });
  },
};

// Export untuk digunakan dengan surveyId yang benar
export const surveyProgramLinkRepositoryWithSurvey = {
  async list(surveyId: string) {
    return surveyProgramLinkRepository.list(surveyId);
  },

  async create(surveyId: string, input: SurveyProgramLinkInput) {
    const survey = await prisma.fieldSurvey.findFirst({
      where: { id: surveyId, deletedAt: null },
    });
    if (!survey) throw new ApiError("SURVEY_NOT_FOUND", "Survey tidak ditemukan.", 404);

    const program = await prisma.program.findFirst({
      where: { id: input.programId, deletedAt: null },
    });
    if (!program) throw new ApiError("PROGRAM_NOT_FOUND", "Program tidak ditemukan.", 404);

    // Cek apakah sudah ada link
    const existing = await prisma.surveyProgramLink.findFirst({
      where: {
        surveyId,
        programId: input.programId,
      },
    });
    if (existing) {
      throw new ApiError("LINK_ALREADY_EXISTS", "Survey sudah terlink ke program ini.", 409);
    }

    return prisma.surveyProgramLink.create({
      data: {
        surveyId,
        programId: input.programId,
        linkedById: input.linkedById,
        relationType: input.relationType ?? "LINKED",
        linkedAt: new Date(),
      },
      include: {
        program: true,
        linkedBy: { select: { id: true, nama: true, role: true } },
      },
    });
  },

  async delete(linkId: string) {
    return surveyProgramLinkRepository.delete(linkId);
  },
};