import type { CreateProgramInput, UpdateProgramInput } from "@/modules/programs/program.types";
import type { SurveyInput } from "@/modules/surveys/survey.types";
import type { AdviceStatus } from "@/generated/prisma/client";
import type { CreateUserInput, UpdateUserInput } from "@/modules/users/user.types";

export type ApiUser = {
  id: number;
  nama: string;
  email: string;
  role: "ADMIN" | "OPERATOR" | "PIMPINAN";
  createdAt: string;
  updatedAt: string;
};

export type AuthData = {
  accessToken: string;
  user: ApiUser;
  expiresAt: string;
};

export type Advice = {
  id: string;
  idKegiatan: number;
  namaKegiatan: string;
  identitasPimpinan: string;
  pimpinanId?: number;
  operatorPenerima: string;
  operatorId?: number | null;
  isi: string;
  tanggal: string;
  status: "BELUM_DITINDAKLANJUTI" | "SUDAH_DITINDAKLANJUTI";
};

export type ApiProgram = {
  id: number;
  kode: string;
  nama: string;
  kategori?: string;
  lokasi?: string;
  kecamatan?: string | null;
  desaKelurahan?: string | null;
  detailLokasi?: string | null;
  operatorPengelola?: string | null;
  operatorPengelolaId?: number | null;
  periode?: string;
  satuan?: string;
  target?: number;
  realisasi?: number;
  pagu?: number;
  penggunaan?: number;
  status: "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI_DIKERJAKAN";
  updatedAt: string;
};

export type PublicProgram = {
  id: number;
  kode: string;
  nama: string;
  kategori: string;
  lokasi: string;
  kecamatan: string | null;
  desaKelurahan?: string | null;
  detailLokasi?: string | null;
  status: "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI_DIKERJAKAN";
  target: number;
  realisasi: number;
  satuan: string;
  pagu: number;
  penggunaan: number;
  operatorPengelola?: string | null;
  operatorPengelolaId?: number | null;
  updatedAt: string;
};

export type PublicProgramFilters = {
  page?: number;
  pageSize?: number;
};

export type ApiSurvey = Record<string, unknown> & {
  id: string;
  kodeSurvey: string;
  status:
    | "DRAFT"
    | "SELESAI_SURVEY"
    | "MENUNGGU_VERIFIKASI"
    | "PERLU_REVISI"
    | "DIVERIFIKASI"
    | "DIKONVERSI";
};

export type CreateAdviceInput = {
  idKegiatan: number;
  namaKegiatan: string;
  operatorPenerima: string;
  operatorId?: number | null;
  isi: string;
};

export type ProgramFilters = {
  page?: number;
  pageSize?: number;
  status?: ApiProgram["status"];
  operatorId?: number;
  kecamatan?: string;
  search?: string;
};

export type UserFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: "Admin" | "Operator" | "Pimpinan";
};

export type SurveyFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?:
    | "DRAFT"
    | "SELESAI_SURVEY"
    | "MENUNGGU_VERIFIKASI"
    | "PERLU_REVISI"
    | "DIVERIFIKASI"
    | "DIKONVERSI";
  kecamatan?: string;
};

export type AdviceFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: AdviceStatus;
  operatorId?: number;
};

export type CreateProgressInput = {
  tanggal: string;
  tahap: string;
  nilai: number;
  satuan: string;
  keterangan: string;
  foto?: boolean;
  storageKey?: string | null;
  originalName?: string | null;
  status: ApiProgram["status"];
};

export type CreateCostInput = {
  tanggal: string;
  uraian: string;
  nominal: number;
  bukti?: boolean;
};

export type ConvertSurveyInput = {
  kode: string;
  nama?: string;
  periode: string;
  satuan: string;
  target: number;
  pagu: number;
  operatorPengelolaId?: number | null;
};

export type { CreateProgramInput, UpdateProgramInput, SurveyInput, CreateUserInput, UpdateUserInput };
export type { DocumentationPhoto } from "@/modules/programs/program.service";
