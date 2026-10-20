import { ApiError } from "@/lib/http/api-error";
import { nonNegativeNumber, optionalString, parseJsonObject, requiredString } from "@/lib/validation";
import type { SurveyInput } from "./survey.types";

const enumValues = {
  kondisi: ["BAIK", "RUSAK_RINGAN", "RUSAK_SEDANG", "RUSAK_BERAT"],
  tingkatUrgensi: ["RENDAH", "SEDANG", "TINGGI_MENDESAK"],
  status: ["DRAFT", "SELESAI_SURVEY", "DIVERIFIKASI"],
} as const;

function enumField<T extends string>(input: Record<string, unknown>, field: string, values: readonly T[]): T {
  const value = requiredString(input, field);
  if (!values.includes(value as T)) throw new ApiError("VALIDATION_ERROR", `${field} tidak valid.`, 400);
  return value as T;
}

export function parseSurveyInput(body: unknown, partial = false): SurveyInput {
  const input = parseJsonObject(body);
  const required = (field: string) => requiredString(input, field);
  const dateValue = input.tanggal === undefined ? undefined : required("tanggal");
  if (dateValue && Number.isNaN(Date.parse(dateValue))) {
    throw new ApiError("VALIDATION_ERROR", "Field tanggal harus berupa tanggal valid.", 400);
  }
  const optionalNumber = (field: string) =>
    input[field] === undefined || input[field] === null ? null : nonNegativeNumber(input, field, false) ?? null;
  if (partial) {
    const result: Record<string, unknown> = {};
    for (const field of [
      "kodeSurvey", "tanggal", "surveyor", "namaKegiatan", "kategori", "kecamatan",
      "desaKelurahan", "detailLokasi", "koordinat", "satuan", "tipeKonstruksi",
      "kontakPendamping", "fotoUrl", "uraianTemuan", "rekomendasi",
    ]) {
      if (input[field] !== undefined) result[field] = field === "koordinat" || field === "satuan" ? optionalString(input, field) : required(field);
    }
    for (const field of ["surveyorId", "programId", "panjang", "lebar", "luasVolume", "estimasiBiaya"]) {
      if (input[field] !== undefined) result[field] = field.endsWith("Id") ? optionalNumber(field) : optionalNumber(field);
    }
    if (input.kondisi !== undefined) result.kondisi = enumField(input, "kondisi", enumValues.kondisi);
    if (input.tingkatUrgensi !== undefined) result.tingkatUrgensi = enumField(input, "tingkatUrgensi", enumValues.tingkatUrgensi);
    if (input.status !== undefined) result.status = enumField(input, "status", enumValues.status);
    if (input.foto !== undefined && typeof input.foto !== "boolean") throw new ApiError("VALIDATION_ERROR", "Field foto harus boolean.", 400);
    if (input.foto !== undefined) result.foto = input.foto;
    if (Object.keys(result).length === 0) throw new ApiError("VALIDATION_ERROR", "Tidak ada data yang diubah.", 400);
    return result as SurveyInput;
  }
  return {
    id: optionalString(input, "id"),
    kodeSurvey: required("kodeSurvey"),
    tanggal: dateValue as string,
    surveyor: required("surveyor"),
    surveyorId: optionalNumber("surveyorId"),
    programId: optionalNumber("programId"),
    namaKegiatan: required("namaKegiatan"),
    kategori: required("kategori"),
    kecamatan: required("kecamatan"),
    desaKelurahan: required("desaKelurahan"),
    detailLokasi: required("detailLokasi"),
    koordinat: optionalString(input, "koordinat") ?? null,
    kondisi: enumField(input, "kondisi", enumValues.kondisi),
    panjang: optionalNumber("panjang"),
    lebar: optionalNumber("lebar"),
    luasVolume: optionalNumber("luasVolume"),
    satuan: optionalString(input, "satuan") ?? null,
    tipeKonstruksi: optionalString(input, "tipeKonstruksi") ?? null,
    estimasiBiaya: optionalNumber("estimasiBiaya"),
    tingkatUrgensi: enumField(input, "tingkatUrgensi", enumValues.tingkatUrgensi),
    uraianTemuan: required("uraianTemuan"),
    rekomendasi: required("rekomendasi"),
    kontakPendamping: optionalString(input, "kontakPendamping") ?? null,
    foto: input.foto === undefined ? false : input.foto === true,
    fotoUrl: optionalString(input, "fotoUrl") ?? null,
    status: enumField(input, "status", enumValues.status),
  };
}
