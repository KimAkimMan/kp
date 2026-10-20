import { prisma } from "@/lib/prisma";

export const surveyRepository = {
  findMany() {
    return prisma.fieldSurvey.findMany({
      include: { program: true, surveyorUser: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
