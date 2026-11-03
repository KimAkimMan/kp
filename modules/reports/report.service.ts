import { ApiError } from "@/lib/http/api-error";
import { ProgramStatus, type Prisma } from "@/generated/prisma/client";
import { reportRepository, type ReportProgramFilters } from "./report.repository";

export const reportService = {
  summary(filters: ReportProgramFilters) {
    if (filters.status && !Object.values(ProgramStatus).includes(filters.status)) {
      throw new ApiError("VALIDATION_ERROR", "Status program tidak valid.", 400);
    }

    const where: Prisma.ProgramWhereInput = {
      deletedAt: null,
      ...(filters.operatorId === undefined
        ? {}
        : {
            OR: [
              { operatorPengelolaId: filters.operatorId },
              { operatorPengelolaId: null },
            ],
          }),
      ...(filters.periode === undefined ? {} : { periode: filters.periode }),
      ...(filters.kecamatan === undefined ? {} : { kecamatan: filters.kecamatan }),
      ...(filters.status === undefined ? {} : { status: filters.status }),
    };
    return reportRepository.programSummary(where);
  },
};
