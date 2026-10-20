import { prisma } from "@/lib/prisma";
import type { CreateProgramInput } from "./program.types";
import type { ProgramListFilters, UpdateProgramInput } from "./program.types";

export const programRepository = {
  findMany(filters: ProgramListFilters = {}) {
    return prisma.program.findMany({
      where: {
        ...(filters.operatorId === undefined ? {} : { operatorPengelolaId: filters.operatorId }),
        ...(filters.status === undefined ? {} : { status: filters.status }),
        ...(filters.kecamatan === undefined ? {} : { kecamatan: filters.kecamatan }),
        ...(filters.search === undefined ? {} : {
          OR: [
            { kode: { contains: filters.search } },
            { nama: { contains: filters.search } },
            { lokasi: { contains: filters.search } },
            { pj: { contains: filters.search } },
          ],
        }),
      },
      include: { operator: true, histories: true, costs: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: number) {
    return prisma.program.findUnique({
      where: { id },
      include: { operator: true, histories: true, costs: true, surveys: true, adviceRecords: true },
    });
  },

  create(input: CreateProgramInput) {
    return prisma.program.create({
      data: {
        ...input,
        namaKegiatan: input.nama,
        targetAwal: input.target,
        targetVolume: input.target,
        realisasi: 0,
        realisasiVolume: 0,
        status: "BELUM_DIKERJAKAN",
        update: "Belum ada pembaruan",
        sumber: "Input API",
        catatan: "",
        penggunaan: 0,
        penggunaanBiaya: 0,
        histories: undefined,
        costs: undefined,
      },
    });
  },

  update(id: number, input: UpdateProgramInput) {
    return prisma.program.update({
      where: { id },
      data: {
        ...input,
        ...(input.tanggalMulai === undefined ? {} : { tanggalMulai: input.tanggalMulai ? new Date(input.tanggalMulai) : null }),
        ...(input.tanggalSelesai === undefined ? {} : { tanggalSelesai: input.tanggalSelesai ? new Date(input.tanggalSelesai) : null }),
      },
      include: { operator: true, histories: true, costs: true },
    });
  },

  delete(id: number) {
    return prisma.program.delete({ where: { id }, select: { id: true } });
  },
};
