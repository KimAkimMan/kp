export type Role = "Admin" | "Operator" | "Pimpinan";

export type PageType =
  | "dashboard"
  | "users"
  | "masteractivities"
  | "adminsurvey"
  | "programs"
  | "survey"
  | "schedule"
  | "history"
  | "reports"
  | "profile"
  | "detail";

export interface User {
  id: number;
  nama: string;
  email: string;
  role: Role;
  password?: string;
}

export interface HistoryItem {
  tanggal: string;
  tahap: string;
  nilai: number;
  satuan: string;
  keterangan: string;
  foto: boolean;
  penginput: string;
  status?: string;
}

export interface CostItem {
  tanggal: string;
  uraian: string;
  nominal: number;
  input: string;
  bukti: boolean;
}

export interface Program {
  id: number;
  kode: string;
  nama: string;
  namaKegiatan?: string;
  kategori: string;
  lokasi: string;
  kecamatan?: string;
  desaKelurahan?: string;
  detailLokasi?: string;
  pj: string;
  operatorPengelola?: string | null;
  operatorPengelolaId?: string | number | null;
  penanggungJawabDinas?: string | null;
  periode: string;
  satuan: string;
  targetAwal: number;
  target: number;
  targetVolume?: number;
  realisasi: number;
  realisasiVolume?: number;
  status: "Belum Dikerjakan" | "Sedang Dikerjakan" | "Selesai Dikerjakan";
  update: string;
  sumber: string;
  catatan: string;
  pagu: number;
  penggunaan: number;
  penggunaanBiaya?: number;
  penyedia?: string;
  direktur?: string;
  nilaiKontrak?: number | null;
  noKontrak?: string | null;
  jadwal?: string;
  lebarJalan?: number;
  kondisiJalan?: "Baik" | "Sedang" | "Rusak" | string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  histories: HistoryItem[];
  costs: CostItem[];
}

export interface AdviceRecord {
  id: string;
  idKegiatan: number;
  namaKegiatan: string;
  identitasPimpinan: string;
  operatorPenerima: string;
  isi: string;
  tanggal: string;
  status: string;
}

export interface VolumeSummary {
  satuan: string;
  target: number;
  realisasi: number;
  sisa: number;
  persentase: number;
}

export interface ProgramSummary {
  volume: VolumeSummary[];
  pagu: number;
  penggunaan: number;
  sisaAnggaran: number;
  berpagu: number;
  tanpaPagu: number;
}

export interface FieldSurvey {
  id: string;
  kodeSurvey: string;
  tanggal: string;
  surveyor: string;
  surveyorId?: number | string;
  programId?: number | null;
  namaKegiatan: string;
  kategori: string;
  kecamatan: string;
  desaKelurahan: string;
  detailLokasi: string;
  koordinat?: string;
  kondisi: "Baik" | "Rusak Ringan" | "Rusak Sedang" | "Rusak Berat";
  panjang?: number;
  lebar?: number;
  luasVolume?: number;
  satuan?: string;
  tipeKonstruksi?: string;
  estimasiBiaya?: number;
  tingkatUrgensi: "Rendah" | "Sedang" | "Tinggi / Mendesak";
  uraianTemuan: string;
  rekomendasi: string;
  kontakPendamping?: string;
  foto?: boolean;
  fotoUrl?: string;
  status: "Draft" | "Selesai Survey" | "Diverifikasi";
  createdAt: string;
}
