import type { CreateProgramInput, UpdateProgramInput } from "@/modules/programs/program.types";
import type { SurveyInput } from "@/modules/surveys/survey.types";
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
  status: string;
};

export type ApiProgram = Record<string, unknown> & {
  id: number;
  kode: string;
  nama: string;
  status: "BELUM_DIKERJAKAN" | "SEDANG_DIKERJAKAN" | "SELESAI_DIKERJAKAN";
};

export type ApiSurvey = Record<string, unknown> & {
  id: string;
  kodeSurvey: string;
  status: "DRAFT" | "SELESAI_SURVEY" | "DIVERIFIKASI";
};

export type CreateAdviceInput = {
  idKegiatan: number;
  namaKegiatan: string;
  identitasPimpinan: string;
  pimpinanId: number;
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

export type UserFilters = { page?: number; pageSize?: number };
export type SurveyFilters = { page?: number; pageSize?: number };
export type AdviceFilters = { page?: number; pageSize?: number };

export type CreateProgressInput = {
  tanggal: string;
  tahap: string;
  nilai: number;
  satuan: string;
  keterangan: string;
  foto?: boolean;
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
  pj: string;
  periode: string;
  satuan: string;
  target: number;
  pagu: number;
};

export type { CreateProgramInput, UpdateProgramInput, SurveyInput, CreateUserInput, UpdateUserInput };
