import { prisma } from "@/lib/prisma";

export const referenceDataRepository = {
  categories: () => prisma.programCategory.findMany({ orderBy: { nama: "asc" } }),
  units: () => prisma.unit.findMany({ orderBy: { nama: "asc" } }),
  periods: () => prisma.period.findMany({ where: { isActive: true }, orderBy: [{ tahun: "desc" }, { nama: "asc" }] }),
  districts: () => prisma.kecamatan.findMany({ orderBy: { nama: "asc" } }),
  villages: (kecamatanId: number) => prisma.village.findMany({ where: { kecamatanId }, orderBy: { nama: "asc" } }),
};
