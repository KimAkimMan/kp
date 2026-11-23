import type { ApiUser, PublicProgram } from "@/lib/api/types";
import type { AdviceRecord, FieldSurvey, Program, Role, User } from "../types";
import { storageKeysToPublicUrls } from "@/app/lib/storage-url";

/**
 * Boundary mapping: enum backend (UPPER_SNAKE) dan DTO API tidak boleh bocor
 * ke komponen UI. Semua penerjemahan ke tipe tampilan dilakukan di sini.
 */
const ROLE_LABELS: Record<ApiUser["role"], Role> = {
  ADMIN: "Admin",
  OPERATOR: "Operator",
  PIMPINAN: "Pimpinan",
};

export const PROGRAM_STATUS_LABELS: Record<PublicProgram["status"], Program["status"]> = {
  BELUM_DIKERJAKAN: "Belum Dikerjakan",
  SEDANG_DIKERJAKAN: "Sedang Dikerjakan",
  SELESAI_DIKERJAKAN: "Selesai Dikerjakan",
};

/** Konversi storageKey (koma-separated) menjadi array URL publik untuk ditampilkan di UI. */
function storageKeysToUrls(storageKey: string | null | undefined): string[] {
  return storageKeysToPublicUrls(storageKey);
}

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
    operatorPengelola: program.operatorPengelola ?? "Belum Ditugaskan",
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

export function mapApiProgramToProgram(p: Record<string, unknown>): Program {
  const statusStr = String(p.status || "");
  const status: Program["status"] =
    statusStr === "SEDANG_DIKERJAKAN" || statusStr === "Sedang Dikerjakan"
      ? "Sedang Dikerjakan"
      : statusStr === "SELESAI_DIKERJAKAN" || statusStr === "Selesai Dikerjakan"
      ? "Selesai Dikerjakan"
      : "Belum Dikerjakan";

  return {
    id: Number(p.id),
    kode: String(p.kode || ""),
    nama: String(p.nama || ""),
    namaKegiatan: String(p.namaKegiatan || p.nama || ""),
    kategori: String(p.kategori || ""),
    lokasi: String(p.lokasi || ""),
    kecamatan: p.kecamatan ? String(p.kecamatan) : "",
    desaKelurahan: p.desaKelurahan ? String(p.desaKelurahan) : "",
    detailLokasi: p.detailLokasi ? String(p.detailLokasi) : "",
    operatorPengelola: p.operatorPengelola ? String(p.operatorPengelola) : "Belum Ditugaskan",
    operatorPengelolaId: p.operatorPengelolaId ? Number(p.operatorPengelolaId) : null,
    penanggungJawabDinas: p.penanggungJawabDinas ? String(p.penanggungJawabDinas) : null,
    periode: p.periode ? String(p.periode) : "2026",
    satuan: p.satuan ? String(p.satuan) : "Unit",
    targetAwal: Number(p.targetAwal ?? p.target ?? 0),
    target: Number(p.target ?? 0),
    targetVolume: Number(p.targetVolume ?? p.target ?? 0),
    realisasi: Number(p.realisasi ?? 0),
    realisasiVolume: Number(p.realisasiVolume ?? p.realisasi ?? 0),
    status,
    update: String(p.update || p.updatedAt || ""),
    sumber: String(p.sumber || ""),
    catatan: String(p.catatan || ""),
    pagu: Number(p.pagu ?? 0),
    penggunaan: Number(p.penggunaan ?? 0),
    penggunaanBiaya: Number(p.penggunaanBiaya ?? p.penggunaan ?? 0),
    penyedia: p.penyedia ? String(p.penyedia) : "",
    direktur: p.direktur ? String(p.direktur) : "",
    nilaiKontrak: p.nilaiKontrak !== undefined && p.nilaiKontrak !== null ? Number(p.nilaiKontrak) : null,
    noKontrak: p.noKontrak ? String(p.noKontrak) : null,
    jadwal: p.jadwal ? String(p.jadwal) : "",
    lebarJalan: p.lebarJalan ? Number(p.lebarJalan) : undefined,
    kondisiJalan: p.kondisiJalan ? String(p.kondisiJalan) : undefined,
    tanggalMulai: p.tanggalMulai ? String(p.tanggalMulai) : undefined,
    tanggalSelesai: p.tanggalSelesai ? String(p.tanggalSelesai) : undefined,
    histories: Array.isArray(p.histories)
      ? (p.histories as Array<Record<string, unknown>>).map((h) => {
          const urls = storageKeysToUrls(String(h.storageKey || ""));
          return {
            ...h,
            fotoUrl: urls[0] || undefined,
            fotoUrls: urls,
          } as Program["histories"][number];
        })
      : [],
    costs: Array.isArray(p.costs) ? (p.costs as Program["costs"]) : [],
  };
}

export function mapApiSurveyToSurvey(s: Record<string, unknown>): FieldSurvey {
  const kondisiKey = String(s.kondisi || "").toUpperCase();
  const kondisi: FieldSurvey["kondisi"] =
    kondisiKey === "BAIK" || s.kondisi === "Baik"
      ? "Baik"
      : kondisiKey === "RUSAK_RINGAN" || s.kondisi === "Rusak Ringan"
      ? "Rusak Ringan"
      : kondisiKey === "RUSAK_SEDANG" || s.kondisi === "Rusak Sedang"
      ? "Rusak Sedang"
      : "Rusak Berat";

  const urgensiKey = String(s.tingkatUrgensi || "").toUpperCase();
  const tingkatUrgensi: FieldSurvey["tingkatUrgensi"] =
    urgensiKey === "RENDAH" || s.tingkatUrgensi === "Rendah"
      ? "Rendah"
      : urgensiKey === "SEDANG" || s.tingkatUrgensi === "Sedang"
      ? "Sedang"
      : "Tinggi / Mendesak";

  const statusKey = String(s.status || "").toUpperCase();
  const status: FieldSurvey["status"] =
    statusKey === "DIKONVERSI" || s.status === "Dikonversi"
      ? "Dikonversi"
      : statusKey === "DIVERIFIKASI" || s.status === "Diverifikasi"
      ? "Diverifikasi"
      : statusKey === "PERLU_REVISI" || s.status === "Perlu Revisi"
      ? "Perlu Revisi"
      : statusKey === "SELESAI_SURVEY" || s.status === "Selesai Survey"
      ? "Selesai Survey"
      : statusKey === "MENUNGGU_VERIFIKASI" || s.status === "Menunggu Verifikasi"
      ? "Menunggu Verifikasi"
      : "Draft";

  let formattedDate = "";
  if (s.tanggal) {
    try {
      formattedDate = new Date(String(s.tanggal)).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      formattedDate = String(s.tanggal);
    }
  }

  return {
    id: String(s.id),
    kodeSurvey: String(s.kodeSurvey || ""),
    tanggal: formattedDate,
    surveyor: String(s.surveyor || ""),
    surveyorId: s.surveyorId ? Number(s.surveyorId) : undefined,
    programId: s.programId ? Number(s.programId) : null,
    namaKegiatan: String(s.namaKegiatan || ""),
    kategori: String(s.kategori || ""),
    kecamatan: String(s.kecamatan || ""),
    desaKelurahan: String(s.desaKelurahan || ""),
    detailLokasi: String(s.detailLokasi || ""),
    koordinat: s.koordinat ? String(s.koordinat) : undefined,
    kondisi,
    panjang: s.panjang ? Number(s.panjang) : undefined,
    lebar: s.lebar ? Number(s.lebar) : undefined,
    luasVolume: s.luasVolume ? Number(s.luasVolume) : undefined,
    satuan: s.satuan ? String(s.satuan) : undefined,
    tipeKonstruksi: s.tipeKonstruksi ? String(s.tipeKonstruksi) : undefined,
    estimasiBiaya: s.estimasiBiaya ? Number(s.estimasiBiaya) : undefined,
    tingkatUrgensi,
    uraianTemuan: String(s.uraianTemuan || ""),
    rekomendasi: String(s.rekomendasi || ""),
    kontakPendamping: s.kontakPendamping ? String(s.kontakPendamping) : undefined,
    foto: Boolean(s.foto),
    fotoUrl: s.fotoUrl ? String(s.fotoUrl) : undefined,
    status,
    createdAt: s.createdAt ? String(s.createdAt) : "",
  };
}

export function mapApiAdviceToAdvice(a: Record<string, unknown>): AdviceRecord {
  const statusStr = String(a.status || "");
  const status =
    statusStr === "SUDAH_DITINDAKLANJUTI" || statusStr === "Sudah ditindaklanjuti"
      ? "Sudah ditindaklanjuti"
      : "Belum ditindaklanjuti";

  let formattedDate = "";
  if (a.tanggal) {
    try {
      formattedDate = new Date(String(a.tanggal)).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      formattedDate = String(a.tanggal);
    }
  }

  return {
    id: String(a.id),
    idKegiatan: Number(a.idKegiatan),
    namaKegiatan: String(a.namaKegiatan || ""),
    identitasPimpinan: String(a.identitasPimpinan || ""),
    operatorPenerima: String(a.operatorPenerima || ""),
    operatorId: a.operatorId ? Number(a.operatorId) : null,
    isi: String(a.isi || ""),
    tanggal: formattedDate,
    status,
  };
}
