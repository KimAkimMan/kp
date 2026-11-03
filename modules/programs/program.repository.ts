import { prisma } from "@/lib/prisma";
import { ProgramAssignmentStatus } from "@/generated/prisma/client";
import type { CreateProgramInput } from "./program.types";
import type { ProgramListFilters, UpdateProgramInput } from "./program.types";

export const programRepository = {
  async findMany(filters: ProgramListFilters = {}) {
    const where = {
      ...(filters.operatorId === undefined
        ? {}
        : {
            OR: [
              { operatorPengelolaId: filters.operatorId },
              { operatorPengelolaId: null },
            ],
          }),
      ...(filters.status === undefined ? {} : { status: filters.status }),
      ...(filters.kecamatan === undefined ? {} : { kecamatan: filters.kecamatan }),
      ...(filters.search === undefined
        ? {}
        : {
            AND: [
              {
                OR: [
                  { kode: { contains: filters.search } },
                  { nama: { contains: filters.search } },
                  { lokasi: { contains: filters.search } },
                  { pj: { contains: filters.search } },
                ],
              },
            ],
          }),
    };
    const [items, total] = await Promise.all([
      prisma.program.findMany({
        where: { ...where, deletedAt: null },
        include: {
          operator: true,
          histories: true,
          progressEntries: true,
          costs: true,
          assignments: { orderBy: { assignedAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        ...(filters.pagination === undefined
          ? {}
          : { skip: filters.pagination.skip, take: filters.pagination.pageSize }),
      }),
      prisma.program.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { items, total };
  },

  findById(id: number) {
    return prisma.program.findFirst({
      where: { id, deletedAt: null },
      include: {
        operator: true,
        histories: true,
        progressEntries: true,
        costs: true,
        assignments: { orderBy: { assignedAt: "desc" } },
        surveys: true,
        adviceRecords: true,
      },
    });
  },

  create(input: CreateProgramInput) {
    return prisma.program.create({
      data: {
        ...input,
        createdById: input.createdById,
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
      },
    });
  },

  async claim(id: number, operatorId: number, operatorName: string, assignedById: number) {
    return prisma.$transaction(async (tx) => {
      const program = await tx.program.findFirst({
        where: { id, deletedAt: null },
      });
      if (!program) return null;
      if (program.operatorPengelolaId === operatorId) {
        const existingAssignment = await tx.programAssignment.findFirst({
          where: {
            programId: id,
            operatorId,
            status: { in: ["DITUGASKAN", "DITERIMA"] },
          },
        });
        if (!existingAssignment) {
          await tx.programAssignment.create({
            data: {
              programId: id,
              operatorId,
              assignedById,
              status: ProgramAssignmentStatus.DITERIMA,
              acceptedAt: new Date(),
            },
          });
        }
        return tx.program.findUnique({
          where: { id },
          include: { operator: true, histories: true, progressEntries: true, costs: true, assignments: true },
        });
      }
      if (program.operatorPengelolaId !== null) return false;

      const claimed = await tx.program.updateMany({
        where: { id, deletedAt: null, operatorPengelolaId: null },
        data: {
          operatorPengelolaId: operatorId,
          operatorPengelola: operatorName,
          pj: operatorName,
        },
      });
      if (claimed.count !== 1) return false;

      await tx.programAssignment.create({
        data: {
          programId: id,
          operatorId,
          assignedById,
          status: ProgramAssignmentStatus.DITERIMA,
          acceptedAt: new Date(),
        },
      });
      return tx.program.findUnique({
        where: { id },
        include: { operator: true, histories: true, progressEntries: true, costs: true, assignments: true },
      });
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

  delete(id: number, deletedById: number) {
    return prisma.program.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById },
      select: { id: true, deletedAt: true },
    });
  },
};
