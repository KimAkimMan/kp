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

  async findDocumentationPhotos() {
    // Program yang sudah selesai dan memiliki operator pengelola (dapat divisualisasikan publik)
    const programs = await prisma.program.findMany({
      where: {
        deletedAt: null,
        status: "SELESAI_DIKERJAKAN",
        operatorPengelolaId: { not: null },
      },
      select: {
        id: true,
        kode: true,
        nama: true,
        kategori: true,
        lokasi: true,
        kecamatan: true,
        desaKelurahan: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    if (programs.length === 0) return [];

    const programIds = programs.map((p) => p.id);

    // Ambil survey yang terhubung ke program (lewat surveyProgramLink atau programId langsung)
    const surveyLinks = await prisma.surveyProgramLink.findMany({
      where: {
        programId: { in: programIds },
      },
      select: {
        surveyId: true,
        programId: true,
      },
    });

    // Jika tidak ada link, coba survey dengan programId langsung (fallback kompatibel)
    const surveysByProgramId = await prisma.fieldSurvey.findMany({
      where: {
        programId: { in: programIds },
        deletedAt: null,
        status: { in: ["DIVERIFIKASI", "DIKONVERSI"] },
      },
      select: {
        id: true,
        programId: true,
      },
    });

    const allSurveyIds = new Set<string>();
    for (const link of surveyLinks) allSurveyIds.add(link.surveyId);
    for (const s of surveysByProgramId) allSurveyIds.add(s.id);

    const surveyIds = Array.from(allSurveyIds);
    if (surveyIds.length === 0) return [];

    const photos = await prisma.surveyPhoto.findMany({
      where: {
        surveyId: { in: surveyIds },
      },
      select: {
        id: true,
        storageKey: true,
        originalName: true,
        mimeType: true,
        caption: true,
        surveyId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Map survey → program untuk menampilkan info kegiatan
    const surveyToProgram = new Map<string, { id: number; kode: string; nama: string; kategori: string; lokasi: string }>();
    for (const link of surveyLinks) {
      const program = programs.find((p) => p.id === link.programId);
      if (program) surveyToProgram.set(link.surveyId, program);
    }
    for (const s of surveysByProgramId) {
      const program = programs.find((p) => p.id === s.programId);
      if (program && !surveyToProgram.has(s.id)) surveyToProgram.set(s.id, program);
    }

    return photos.map((photo) => ({
      ...photo,
      program: surveyToProgram.get(photo.surveyId) ?? null,
    }));
  },
};
