import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { paginatedResponse } from "@/lib/http/api-response";
import { parsePagination } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { ProgramStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const pagination = parsePagination(request.nextUrl.searchParams);
    const where = {
      deletedAt: null,
      status: { in: [ProgramStatus.SEDANG_DIKERJAKAN, ProgramStatus.SELESAI_DIKERJAKAN] },
      operatorPengelolaId: { not: null },
    };
    const [items, total] = await Promise.all([
      prisma.program.findMany({
        where,
        select: {
          id: true,
          kode: true,
          nama: true,
          kategori: true,
          lokasi: true,
          kecamatan: true,
          desaKelurahan: true,
          detailLokasi: true,
          status: true,
          satuan: true,
          operatorPengelola: true,
          operatorPengelolaId: true,
          target: true,
          realisasi: true,
          pagu: true,
          penggunaan: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        skip: pagination.skip,
        take: pagination.pageSize,
      }),
      prisma.program.count({ where }),
    ]);
    return paginatedResponse(items, { ...pagination, total, totalPages: Math.ceil(total / pagination.pageSize) });
  });
}
