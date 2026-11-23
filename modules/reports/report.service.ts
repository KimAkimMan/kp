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
        : { operatorPengelolaId: filters.operatorId }),
      ...(filters.periode === undefined ? {} : { periode: { contains: filters.periode } }),
      ...(filters.kecamatan === undefined ? {} : { kecamatan: filters.kecamatan }),
      ...(filters.status === undefined ? {} : { status: filters.status }),
    };
    return reportRepository.programSummary(where);
  },
};
