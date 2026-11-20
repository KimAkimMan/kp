import {
  nonNegativeNumber,
  optionalString,
  parseJsonObject,
  requiredString,
} from "@/lib/validation";
import { ApiError } from "@/lib/http/api-error";
import type { CreateProgramInput } from "./program.types";
import type { ProgramListFilters, UpdateProgramInput } from "./program.types";

export function parseCreateProgramInput(body: unknown): CreateProgramInput {
  const input = parseJsonObject(body);
  return {
    kode: requiredString(input, "kode"),
    nama: requiredString(input, "nama"),
    kategori: requiredString(input, "kategori"),
    lokasi: requiredString(input, "lokasi"),
    pj: requiredString(input, "pj"),
    periode: requiredString(input, "periode"),
    satuan: requiredString(input, "satuan"),
    target: nonNegativeNumber(input, "target") as number,
    pagu: nonNegativeNumber(input, "pagu") as number,
    namaKegiatan: input.namaKegiatan !== undefined ? requiredString(input, "namaKegiatan") : undefined,
    kecamatan: optionalString(input, "kecamatan"),
    desaKelurahan: optionalString(input, "desaKelurahan"),
    detailLokasi: optionalString(input, "detailLokasi"),
    operatorPengelola: optionalString(input, "operatorPengelola"),
    operatorPengelolaId: input.operatorPengelolaId !== null && input.operatorPengelolaId !== undefined
      ? nonNegativeNumber(input, "operatorPengelolaId", false) as number | undefined
      : null,
    targetAwal: input.targetAwal !== undefined ? nonNegativeNumber(input, "targetAwal", false) as number | undefined : undefined,
    targetVolume: input.targetVolume !== undefined ? nonNegativeNumber(input, "targetVolume", false) as number | undefined : null,
    realisasi: input.realisasi !== undefined ? nonNegativeNumber(input, "realisasi", false) as number | undefined : undefined,
    realisasiVolume: input.realisasiVolume !== undefined ? nonNegativeNumber(input, "realisasiVolume", false) as number | undefined : null,
    status: input.status !== undefined ? requiredString(input, "status") as "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI_DIKERJAKAN" : undefined,
    update: optionalString(input, "update"),
    sumber: optionalString(input, "sumber"),
    catatan: optionalString(input, "catatan"),
    penggunaan: input.penggunaan !== undefined ? nonNegativeNumber(input, "penggunaan", false) as number | undefined : undefined,
    penggunaanBiaya: input.penggunaanBiaya !== undefined ? nonNegativeNumber(input, "penggunaanBiaya", false) as number | undefined : null,
  };
}

/**
 * Mengonversi body request upsert program. Kunci penggabungan adalah `kode`:
 * jika program dengan kode tersebut sudah ada maka diperbarui, jika belum
 * maka dibuat baru. Semua field wajib create harus tersedia agar hasil create
 * tetap valid.
 */
export function parseUpsertProgramInput(body: unknown): CreateProgramInput {
  return parseCreateProgramInput(body);
}

export function parseUpdateProgramInput(body: unknown): UpdateProgramInput {
  const input = parseJsonObject(body);
  const result: UpdateProgramInput = {};
  const strings = [
    "kode", "nama", "kategori", "lokasi", "pj", "periode", "satuan",
    "namaKegiatan", "kecamatan", "desaKelurahan", "detailLokasi", "operatorPengelola",
    "penanggungJawabDinas", "jadwal", "update", "sumber", "catatan", "penyedia",
    "direktur", "noKontrak", "kondisiJalan",
  ] as const;
  for (const field of strings) {
    if (input[field] !== undefined) result[field] = requiredString(input, field) as never;
  }
  const numbers = [
    "target", "pagu", "targetAwal", "targetVolume", "realisasi", "realisasiVolume",
    "penggunaan", "penggunaanBiaya", "nilaiKontrak", "lebarJalan",
  ] as const;
  for (const field of numbers) {
    if (input[field] !== undefined) {
      result[field] = nonNegativeNumber(input, field, false) as never;
    }
  }
  if (input.operatorPengelolaId !== undefined) {
    if (input.operatorPengelolaId !== null) {
      result.operatorPengelolaId = nonNegativeNumber(input, "operatorPengelolaId") as number;
    } else {
      result.operatorPengelolaId = null;
    }
  }
  for (const field of ["tanggalMulai", "tanggalSelesai"] as const) {
    if (input[field] !== undefined) {
      const value = optionalString(input, field);
      if (value && Number.isNaN(Date.parse(value))) {
        throw new ApiError("VALIDATION_ERROR", `Field ${field} harus berupa tanggal valid.`, 400);
      }
      result[field] = value ?? null;
    }
  }
  if (input.status !== undefined) {
    const status = requiredString(input, "status");
    if (!["BELUM_DIKERJAKAN", "SEDANG_DIKERJAKAN", "SELESAI_DIKERJAKAN"].includes(status)) {
      throw new ApiError("VALIDATION_ERROR", "Status program tidak valid.", 400);
    }
    result.status = status as UpdateProgramInput["status"];
  }
  if (Object.keys(result).length === 0) {
    throw new ApiError("VALIDATION_ERROR", "Tidak ada data yang diubah.", 400);
  }
  return result;
}

export function parseProgramListFilters(params: URLSearchParams): ProgramListFilters {
  const status = params.get("status") ?? undefined;
  if (status && !["BELUM_DIKERJAKAN", "SEDANG_DIKERJAKAN", "SELESAI_DIKERJAKAN"].includes(status)) {
    throw new ApiError("VALIDATION_ERROR", "Status program tidak valid.", 400);
  }
  const operatorId = params.get("operatorId");
  return {
    status: status as ProgramListFilters["status"],
    kecamatan: params.get("kecamatan") ?? undefined,
    search: params.get("search")?.trim() || undefined,
    operatorId: operatorId ? Number(operatorId) : undefined,
  };
}
