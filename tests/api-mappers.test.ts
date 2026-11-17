import { describe, expect, it } from "vitest";
import {
  mapApiUserToUser,
  mapPublicProgramToProgram,
  mapApiProgramToProgram,
  mapApiSurveyToSurvey,
  mapApiAdviceToAdvice,
} from "@/app/utils/api-mappers";
import type { ApiUser, PublicProgram } from "@/lib/api/types";

const apiUser: ApiUser = {
  id: 7,
  nama: "Admin KP",
  email: "admin@kp.local",
  role: "ADMIN",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const publicProgram: PublicProgram = {
  id: 12,
  kode: "SEED-P-001",
  nama: "Pembangunan Jalan Lingkungan",
  kategori: "Jalan Lingkungan",
  lokasi: "Desa Ancaran, Kec. Kuningan",
  kecamatan: null,
  desaKelurahan: null,
  detailLokasi: null,
  status: "SELESAI_DIKERJAKAN",
  target: 1500,
  realisasi: 1500,
  satuan: "M",
  pagu: 250000000,
  penggunaan: 240000000,
  operatorPengelola: null,
  operatorPengelolaId: null,
  updatedAt: "2026-02-01T00:00:00.000Z",
};

describe("API boundary mappers", () => {
  it("maps backend roles to display roles", () => {
    expect(mapApiUserToUser(apiUser).role).toBe("Admin");
    expect(mapApiUserToUser({ ...apiUser, role: "OPERATOR" }).role).toBe("Operator");
    expect(mapApiUserToUser({ ...apiUser, role: "PIMPINAN" }).role).toBe("Pimpinan");
  });

  it("drops backend-only credential fields from the display user", () => {
    const user = mapApiUserToUser(apiUser);

    expect(user).toEqual({
      id: 7,
      nama: "Admin KP",
      email: "admin@kp.local",
      role: "Admin",
    });
    expect(user).not.toHaveProperty("password");
  });

  it("maps public program status and nullable fields for display", () => {
    const program = mapPublicProgramToProgram(publicProgram);

    expect(program.status).toBe("Selesai Dikerjakan");
    expect(program.kecamatan).toBe("");
    expect(program.desaKelurahan).toBe("");
    expect(program.pj).toBe("Belum Ditugaskan");
    expect(program.pagu).toBe(250000000);
    expect(program.penggunaan).toBe(240000000);
    expect(program.operatorPengelolaId).toBeNull();
  });

  it("maps full API program DTO to display Program model", () => {
    const program = mapApiProgramToProgram({
      id: 1,
      kode: "PRG-01",
      nama: "Jalan Desa",
      status: "SEDANG_DIKERJAKAN",
      pagu: 100000000,
      penggunaan: 50000000,
      target: 500,
      realisasi: 250,
      operatorPengelolaId: 5,
      operatorPengelola: "Asep",
    });

    expect(program.status).toBe("Sedang Dikerjakan");
    expect(program.operatorPengelolaId).toBe(5);
    expect(program.operatorPengelola).toBe("Asep");
    expect(program.pagu).toBe(100000000);
  });

  it("maps API survey DTO to display FieldSurvey model", () => {
    const survey = mapApiSurveyToSurvey({
      id: "srv-1",
      kodeSurvey: "SRV-001",
      kondisi: "RUSAK_BERAT",
      tingkatUrgensi: "TINGGI_MENDESAK",
      status: "DIVERIFIKASI",
      estimasiBiaya: 75000000,
    });

    expect(survey.kondisi).toBe("Rusak Berat");
    expect(survey.tingkatUrgensi).toBe("Tinggi / Mendesak");
    expect(survey.status).toBe("Diverifikasi");
    expect(survey.estimasiBiaya).toBe(75000000);
  });

  it("maps API advice DTO to display AdviceRecord model", () => {
    const advice = mapApiAdviceToAdvice({
      id: "adv-1",
      idKegiatan: 10,
      namaKegiatan: "Drainase",
      identitasPimpinan: "Pak Bupati",
      operatorPenerima: "Asep",
      isi: "Percepat pekerjaan",
      status: "BELUM_DITINDAKLANJUTI",
      tanggal: "2026-03-01T10:00:00.000Z",
    });

    expect(advice.status).toBe("Belum ditindaklanjuti");
    expect(advice.identitasPimpinan).toBe("Pak Bupati");
  });
});
