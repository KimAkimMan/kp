import { describe, expect, it } from "vitest";
import {
  mapApiUserToUser,
  mapPublicProgramToProgram,
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
});
