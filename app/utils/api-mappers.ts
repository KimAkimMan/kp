import type { ApiUser, PublicProgram } from "@/lib/api/types";
import type { Program, Role, User } from "../types";

/**
 * Boundary mapping: enum backend (UPPER_SNAKE) dan DTO API tidak boleh bocor
 * ke komponen UI. Semua penerjemahan ke tipe tampilan dilakukan di sini.
 */
const ROLE_LABELS: Record<ApiUser["role"], Role> = {
  ADMIN: "Admin",
  OPERATOR: "Operator",
  PIMPINAN: "Pimpinan",
};

const PROGRAM_STATUS_LABELS: Record<PublicProgram["status"], Program["status"]> = {
  BELUM_DIKERJAKAN: "Belum Dikerjakan",
  SEDANG_DIKERJAKAN: "Sedang Dikerjakan",
  SELESAI_DIKERJAKAN: "Selesai Dikerjakan",
};

export function mapApiUserToUser(user: ApiUser): User {
  return {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: ROLE_LABELS[user.role],
  };
}

export function mapPublicProgramToProgram(program: PublicProgram): Program {
  return {
    id: program.id,
    kode: program.kode,
    nama: program.nama,
    namaKegiatan: program.nama,
    kategori: program.kategori,
    lokasi: program.lokasi,
    kecamatan: program.kecamatan ?? "",
    desaKelurahan: program.desaKelurahan ?? "",
    detailLokasi: program.detailLokasi ?? "",
    pj: program.operatorPengelola ?? "Belum Ditugaskan",
    operatorPengelola: program.operatorPengelola ?? null,
    operatorPengelolaId: program.operatorPengelolaId ?? null,
    penanggungJawabDinas: null,
    periode: "2026",
    satuan: program.satuan,
    targetAwal: program.target,
    target: program.target,
    targetVolume: program.target,
    realisasi: program.realisasi,
    realisasiVolume: program.realisasi,
    status: PROGRAM_STATUS_LABELS[program.status],
    update: program.updatedAt,
    sumber: "Dokumentasi Transparansi",
    catatan: "",
    pagu: Number(program.pagu) || 0,
    penggunaan: Number(program.penggunaan) || 0,
    penggunaanBiaya: Number(program.penggunaan) || 0,
    histories: [],
    costs: [],
  };
}
