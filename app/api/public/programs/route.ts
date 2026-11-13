import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { paginatedResponse } from "@/lib/http/api-response";
import { parsePagination } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const pagination = parsePagination(request.nextUrl.searchParams);
    const [items, total] = await Promise.all([
      prisma.program.findMany({
        where: { deletedAt: null },
        select: { id: true, kode: true, nama: true, kategori: true, lokasi: true, kecamatan: true, status: true, target: true, realisasi: true, satuan: true, updatedAt: true },
        orderBy: { updatedAt: "desc" }, skip: pagination.skip, take: pagination.pageSize,
      }),
      prisma.program.count({ where: { deletedAt: null } }),
    ]);
    return paginatedResponse(items, { ...pagination, total, totalPages: Math.ceil(total / pagination.pageSize) });
  });
}
