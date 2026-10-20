export type CreateProgramInput = {
  kode: string;
  nama: string;
  kategori: string;
  lokasi: string;
  pj: string;
  periode: string;
  satuan: string;
  target: number;
  pagu: number;
};

export type UpdateProgramInput = Partial<CreateProgramInput> & {
  namaKegiatan?: string;
  kecamatan?: string;
  desaKelurahan?: string;
  detailLokasi?: string;
  operatorPengelolaId?: number | null;
  operatorPengelola?: string | null;
  penanggungJawabDinas?: string | null;
  jadwal?: string | null;
  targetAwal?: number;
  targetVolume?: number | null;
  realisasi?: number;
  realisasiVolume?: number | null;
  status?: "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI_DIKERJAKAN";
  update?: string;
  sumber?: string;
  catatan?: string;
  penggunaan?: number;
  penggunaanBiaya?: number | null;
  penyedia?: string | null;
  direktur?: string | null;
  nilaiKontrak?: number | null;
  noKontrak?: string | null;
  lebarJalan?: number | null;
  kondisiJalan?: string | null;
  tanggalMulai?: string | null;
  tanggalSelesai?: string | null;
};

export type ProgramListFilters = {
  operatorId?: number;
  status?: "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI_DIKERJAKAN";
  kecamatan?: string;
  search?: string;
  pagination?: {
    skip: number;
    pageSize: number;
  };
};
