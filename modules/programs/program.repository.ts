import { prisma } from "@/lib/prisma";
import { ProgramAssignmentStatus } from "@/generated/prisma/client";
import type { CreateProgramInput } from "./program.types";
import type { ProgramListFilters, UpdateProgramInput } from "./program.types";
import { publicUserSelect } from "../auth/auth.repository";

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
                ],
              },
            ],
          }),
    };
    const [items, total] = await Promise.all([
      prisma.program.findMany({
        where: { ...where, deletedAt: null },
        include: {
          operator: { select: publicUserSelect },
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
        operator: { select: publicUserSelect },
        histories: true,
        progressEntries: true,
        costs: true,
        assignments: { orderBy: { assignedAt: "desc" } },
        surveys: true,
        adviceRecords: true,
      },
    });
  },

  async create(input: CreateProgramInput) {
    const createdById = input.createdById ?? 0;
    // Pagu dan nilaiKontrak ditentukan oleh operator bersama CV,
    // bukan admin saat inisiasi. Default pagu 0, nilaiKontrak null.
    const paguValue = Number(input.pagu ?? 0);
    const nilaiKontrakValue = input.nilaiKontrak ?? null;
    const recentDuplicate = await prisma.program.findFirst({
      where: {
        deletedAt: null,
        createdById,
        nama: input.nama,
        kategori: input.kategori,
        lokasi: input.lokasi,
        periode: input.periode,
        satuan: input.satuan,
        target: input.target,
        pagu: paguValue,
        createdAt: { gte: new Date(Date.now() - 300_000) },
      },
      orderBy: { createdAt: "desc" },
    });
    if (recentDuplicate) return { program: recentDuplicate, isDuplicate: true };

    return prisma.$transaction(async (tx) => {
      const program = await tx.program.create({
        data: {
          ...input,
          createdById,
          namaKegiatan: input.namaKegiatan ?? input.nama,
          targetAwal: input.targetAwal ?? input.target,
          targetVolume: input.targetVolume ?? input.target,
          realisasi: input.realisasi ?? 0,
          realisasiVolume: input.realisasiVolume ?? 0,
          status: input.status ?? "BELUM_DIKERJAKAN",
          update: input.update ?? "Belum ada pembaruan",
          sumber: input.sumber ?? "Input API",
          catatan: input.catatan ?? "",
          penggunaan: input.penggunaan ?? 0,
          penggunaanBiaya: input.penggunaanBiaya ?? 0,
          pagu: paguValue,
          nilaiKontrak: nilaiKontrakValue,
        },
      });

      // Buat penugasan operator dalam transaksi yang sama jika operatorPengelolaId disediakan.
      if (input.operatorPengelolaId !== null && input.operatorPengelolaId !== undefined) {
        await tx.programAssignment.create({
          data: {
            programId: program.id,
            operatorId: input.operatorPengelolaId,
            assignedById: createdById,
            status: "DITUGASKAN",
            notes: input.catatan ?? null,
            assignedAt: new Date(),
          },
        });
      }

      return { program, isDuplicate: false };
    });
  },

  async upsertByKode(input: CreateProgramInput, createdById: number) {
    // Pagu dan nilaiKontrak ditentukan oleh operator bersama CV,
    // bukan admin saat inisiasi. Default pagu 0, nilaiKontrak null.
    const paguValue = Number(input.pagu ?? 0);
    const nilaiKontrakValue = input.nilaiKontrak ?? null;
    return prisma.$transaction(async (tx) => {
      const existing = await tx.program.findFirst({
        where: { kode: input.kode, deletedAt: null },
      });

      const data = {
        nama: input.nama,
        kategori: input.kategori,
        lokasi: input.lokasi,
        periode: input.periode,
        satuan: input.satuan,
        target: input.target,
        pagu: paguValue,
        nilaiKontrak: nilaiKontrakValue,
        namaKegiatan: input.namaKegiatan ?? input.nama,
        kecamatan: input.kecamatan,
        desaKelurahan: input.desaKelurahan,
        detailLokasi: input.detailLokasi,
        operatorPengelola: input.operatorPengelola,
        operatorPengelolaId: input.operatorPengelolaId,
        targetAwal: input.targetAwal ?? input.target,
        targetVolume: input.targetVolume ?? input.target,
        realisasi: input.realisasi ?? 0,
        realisasiVolume: input.realisasiVolume ?? 0,
        status: input.status ?? "BELUM_DIKERJAKAN",
        update: input.update ?? "Belum ada pembaruan",
        sumber: input.sumber ?? "Input API",
        catatan: input.catatan ?? "",
        penggunaan: input.penggunaan ?? 0,
        penggunaanBiaya: input.penggunaanBiaya ?? 0,
      };

      if (existing) {
        // Saat update existing program, jangan overwrite field yang tidak
        // secara eksplisit dikirim (realisasi, penggunaan, status, dll).
        const updateData: Record<string, unknown> = {};
        const explicitlySet = (k: string, v: unknown) => {
          if (v !== undefined && v !== null) updateData[k] = v;
        };
        explicitlySet("nama", data.nama);
        explicitlySet("kategori", data.kategori);
        explicitlySet("lokasi", data.lokasi);
        explicitlySet("periode", data.periode);
        explicitlySet("satuan", data.satuan);
        explicitlySet("target", data.target);
        // Pagu dan nilaiKontrak hanya di-overwrite jika admin/operator
        // secara eksplisit mengirimnya dalam update (bukan default 0 dari inisiasi).
        if (input.pagu !== undefined) explicitlySet("pagu", data.pagu);
        if (input.nilaiKontrak !== undefined) explicitlySet("nilaiKontrak", data.nilaiKontrak);
        explicitlySet("namaKegiatan", data.namaKegiatan);
        explicitlySet("kecamatan", data.kecamatan);
        explicitlySet("desaKelurahan", data.desaKelurahan);
        explicitlySet("detailLokasi", data.detailLokasi);
        explicitlySet("operatorPengelola", data.operatorPengelola);
        explicitlySet("operatorPengelolaId", data.operatorPengelolaId);
        explicitlySet("targetAwal", data.targetAwal);
        explicitlySet("targetVolume", data.targetVolume);
        // Hanya overwrite realisasi/penggunaan/status jika secara eksplisit dikirim
        if (input.realisasi !== undefined) explicitlySet("realisasi", input.realisasi);
        if (input.realisasiVolume !== undefined) explicitlySet("realisasiVolume", input.realisasiVolume);
        if (input.status !== undefined) explicitlySet("status", input.status);
        if (input.penggunaan !== undefined) explicitlySet("penggunaan", input.penggunaan);
        if (input.penggunaanBiaya !== undefined) explicitlySet("penggunaanBiaya", input.penggunaanBiaya);
        explicitlySet("update", data.update);
        explicitlySet("sumber", data.sumber);
        explicitlySet("catatan", data.catatan);

        const updated = await tx.program.update({
          where: { id: existing.id },
          data: updateData,
        });
        return { program: updated, created: false };
      }

      const program = await tx.program.create({
        data: { ...data, kode: input.kode, createdById },
      });

      if (input.operatorPengelolaId !== null && input.operatorPengelolaId !== undefined) {
        await tx.programAssignment.create({
          data: {
            programId: program.id,
            operatorId: input.operatorPengelolaId,
            assignedById: createdById,
            status: "DITUGASKAN",
            notes: input.catatan ?? null,
            assignedAt: new Date(),
          },
        });
      }

      return { program, created: true };
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

  async update(id: number, input: UpdateProgramInput) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.program.findFirst({
        where: { id, deletedAt: null },
        select: { operatorPengelolaId: true },
      });
      if (!existing) return null;

      // Jika operatorPengelolaId berubah, sinkronkan operatorPengelola string
      let operatorPengelola: string | null | undefined = undefined;
      if (input.operatorPengelolaId !== undefined && input.operatorPengelolaId !== existing.operatorPengelolaId) {
        if (input.operatorPengelolaId !== null) {
          const user = await tx.user.findUnique({
            where: { id: input.operatorPengelolaId },
            select: { nama: true },
          });
          if (user) operatorPengelola = user.nama;
        } else {
          operatorPengelola = null;
        }
      }

      const program = await tx.program.update({
        where: { id },
        data: {
          ...input,
          ...(operatorPengelola !== undefined ? { operatorPengelola } : {}),
          ...(input.tanggalMulai === undefined ? {} : { tanggalMulai: input.tanggalMulai ? new Date(input.tanggalMulai) : null }),
          ...(input.tanggalSelesai === undefined ? {} : { tanggalSelesai: input.tanggalSelesai ? new Date(input.tanggalSelesai) : null }),
        },
        include: { operator: { select: publicUserSelect }, histories: true, costs: true },
      });

      if (input.operatorPengelolaId !== undefined) {
        await tx.programAssignment.updateMany({
          where: {
            programId: id,
            status: { in: ["DITUGASKAN", "DITERIMA"] },
            ...(existing.operatorPengelolaId === null
              ? {}
              : { operatorId: { not: input.operatorPengelolaId ?? -1 } }),
          },
          data: { status: "DILEPAS", releasedAt: new Date() },
        });

        if (input.operatorPengelolaId !== null) {
          const activeAssignment = await tx.programAssignment.findFirst({
            where: {
              programId: id,
              operatorId: input.operatorPengelolaId,
              status: { in: ["DITUGASKAN", "DITERIMA"] },
            },
          });
          if (!activeAssignment) {
            await tx.programAssignment.create({
              data: {
                programId: id,
                operatorId: input.operatorPengelolaId,
                assignedById: null,
                status: "DITUGASKAN",
              },
            });
          }
        }
      }

      return program;
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
    // Program yang sudah selesai atau sedang dikerjakan dan memiliki operator pengelola
    // (dapat divisualisasikan publik sebagai dokumentasi kegiatan)
    const programs = await prisma.program.findMany({
      where: {
        deletedAt: null,
        status: { in: ["SELESAI_DIKERJAKAN", "SEDANG_DIKERJAKAN"] },
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
        status: true,
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
        status: { in: ["SELESAI_SURVEY", "DIVERIFIKASI", "DIKONVERSI"] },
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
    const surveyToProgram = new Map<string, { id: number; kode: string; nama: string; kategori: string; lokasi: string; status: string }>();
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
