import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findCostById: vi.fn(),
  findDocumentById: vi.fn(),
  findProgramById: vi.fn(),
  updateProgram: vi.fn(),
  auditCreate: vi.fn(),
  presignDownload: vi.fn(),
  prisma: {
    $transaction: vi.fn(),
    progressFindUnique: vi.fn(),
  },
}));

vi.mock("@/modules/programs/program-cost.repository", () => ({
  programCostRepository: {
    findById: mocks.findCostById,
    findDocumentById: mocks.findDocumentById,
  },
}));

vi.mock("@/modules/programs/program.repository", () => ({
  programRepository: {
    findById: mocks.findProgramById,
    update: mocks.updateProgram,
  },
}));

vi.mock("@/modules/storage/direct-upload.service", () => ({
  presignDownload: mocks.presignDownload,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: { create: mocks.auditCreate },
    $transaction: mocks.prisma.$transaction,
    programProgress: { findUnique: mocks.prisma.progressFindUnique },
  },
}));

import { programCostService } from "@/modules/programs/program-cost.service";
import { programService } from "@/modules/programs/program.service";
import { programProgressRepository } from "@/modules/programs/program-progress.repository";

function authenticatedUser(
  id: number,
  nama: string,
  email: string,
  role: "ADMIN" | "OPERATOR",
) {
  return {
    id,
    nama,
    email,
    role,
    sessionId: "test-session",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-11-23"),
  };
}

function programFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    kode: "K-1",
    nama: "Program",
    namaKegiatan: "Program",
    kategori: "Jalan",
    categoryId: null,
    periodId: null,
    lokasi: "Lokasi",
    kecamatan: null,
    kecamatanId: null,
    desaKelurahan: null,
    villageId: null,
    detailLokasi: null,
    operatorPengelola: null,
    operatorPengelolaId: 7,
    penyedia: null,
    direktur: null,
    noKontrak: null,
    nilaiKontrak: null,
    periode: "2026",
    satuan: "KM",
    target: 10,
    targetAwal: 10,
    targetVolume: 10,
    realisasi: 8,
    realisasiVolume: 8,
    pagu: 100,
    penggunaan: 50,
    penggunaanBiaya: 50,
    status: "SEDANG_DIKERJAKAN",
    jadwal: null,
    lebarJalan: null,
    kondisiJalan: null,
    tanggalMulai: null,
    tanggalSelesai: null,
    catatan: null,
    sumber: null,
    update: "2026-11-23",
    createdAt: new Date("2026-11-23"),
    updatedAt: new Date("2026-11-23"),
    deletedAt: null,
    deletedById: null,
    ...overrides,
  };
}

describe("program security invariants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.presignDownload.mockReturnValue({ downloadUrl: "https://download.example/file" });
  });

  it("menolak Operator mengunduh dokumen biaya program milik Operator lain", async () => {
    mocks.findCostById.mockResolvedValue({
      id: 10,
      program: { operatorPengelolaId: 99 },
    });

    await expect(programCostService.download(
      10,
      "doc-1",
      authenticatedUser(7, "Operator 7", "op7@example.com", "OPERATOR"),
    )).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
    expect(mocks.findDocumentById).not.toHaveBeenCalled();
  });

  it("mengizinkan Operator pemilik program mengunduh dokumen biayanya", async () => {
    mocks.findCostById.mockResolvedValue({
      id: 10,
      program: { operatorPengelolaId: 7 },
    });
    mocks.findDocumentById.mockResolvedValue({
      id: "doc-1",
      costId: 10,
      storageKey: "costs/10/doc.pdf",
      originalName: "doc.pdf",
      mimeType: "application/pdf",
    });

    await expect(programCostService.download(
      10,
      "doc-1",
      authenticatedUser(7, "Operator 7", "op7@example.com", "OPERATOR"),
    )).resolves.toMatchObject({
      document: { id: "doc-1" },
      downloadUrl: "https://download.example/file",
    });
  });

  it("menolak target PATCH yang lebih kecil dari realisasi", async () => {
    mocks.findProgramById.mockResolvedValue(programFixture());

    await expect(programService.update(
      1,
      { target: 7 },
      authenticatedUser(1, "Admin", "admin@example.com", "ADMIN"),
    )).rejects.toMatchObject({
      code: "TARGET_BELOW_REALISASI",
      status: 400,
    });
    expect(mocks.updateProgram).not.toHaveBeenCalled();
  });

  it("menolak pagu PATCH yang lebih kecil dari penggunaan", async () => {
    mocks.findProgramById.mockResolvedValue(programFixture());

    await expect(programService.update(
      1,
      { pagu: 40 },
      authenticatedUser(1, "Admin", "admin@example.com", "ADMIN"),
    )).rejects.toMatchObject({
      code: "PAGU_BELOW_USAGE",
      status: 400,
    });
    expect(mocks.updateProgram).not.toHaveBeenCalled();
  });

  it("mengunci baris Program sebelum menghitung realisasi hasil verifikasi progres", async () => {
    mocks.prisma.progressFindUnique.mockResolvedValue({
      id: 5,
      programId: 1,
      status: "DIAJUKAN",
      program: { operatorPengelolaId: 7 },
    });

    const tx = {
      $queryRawUnsafe: vi.fn().mockResolvedValue([{
        id: 1,
        target: 10,
        status: "SEDANG_DIKERJAKAN",
        pagu: 100,
      }]),
      programProgress: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUnique: vi.fn().mockResolvedValue({
          id: 5,
          programId: 1,
          status: "DIVERIFIKASI",
          reportedBy: null,
          verifiedBy: null,
        }),
        aggregate: vi.fn().mockResolvedValue({ _sum: { volume: 12 } }),
      },
      auditLog: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) },
      program: { update: vi.fn() },
    };
    mocks.prisma.$transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) =>
      callback(tx),
    );

    await expect(programProgressRepository.verify(
      5,
      "APPROVED",
      1,
    )).rejects.toMatchObject({
      code: "REALISASI_EXCEEDS_TARGET",
      status: 400,
    });

    expect(tx.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("FOR UPDATE"),
      1,
    );
    expect(tx.program.update).not.toHaveBeenCalled();
  });
});
