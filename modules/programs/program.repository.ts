import { prisma } from "@/lib/prisma";
import type { CreateProgramInput } from "./program.types";

export const programRepository = {
  findMany() {
    return prisma.program.findMany({
      include: { operator: true, histories: true, costs: true },
      orderBy: { createdAt: "desc" },
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
};
