import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/modules/auth/auth.crypto";
import { UserRole } from "@/generated/prisma/client";

const password = "Password123!";

async function main() {
  const passwordHash = await hashPassword(password);
  const [admin, operator, pimpinan] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@kp.local" },
      update: { nama: "Admin KP", role: UserRole.ADMIN, passwordHash },
      create: { nama: "Admin KP", email: "admin@kp.local", role: UserRole.ADMIN, passwordHash },
    }),
    prisma.user.upsert({
      where: { email: "operator@kp.local" },
      update: { nama: "Operator KP", role: UserRole.OPERATOR, passwordHash },
      create: { nama: "Operator KP", email: "operator@kp.local", role: UserRole.OPERATOR, passwordHash },
    }),
    prisma.user.upsert({
      where: { email: "pimpinan@kp.local" },
      update: { nama: "Pimpinan KP", role: UserRole.PIMPINAN, passwordHash },
      create: { nama: "Pimpinan KP", email: "pimpinan@kp.local", role: UserRole.PIMPINAN, passwordHash },
    }),
  ]);

  const category = await prisma.programCategory.upsert({
    where: { nama: "Infrastruktur Jalan" },
    update: {},
    create: { nama: "Infrastruktur Jalan" },
  });
  const unit = await prisma.unit.upsert({
    where: { nama: "Kilometer" },
    update: {},
    create: { nama: "Kilometer" },
  });
  const kecamatan = await prisma.kecamatan.upsert({
    where: { nama: "Kuningan" },
    update: {},
    create: { nama: "Kuningan" },
  });

  const program = await prisma.program.upsert({
    where: { kode: "SEED-P-001" },
    update: {
      deletedAt: null,
      deletedById: null,
      operatorPengelolaId: operator.id,
      operatorPengelola: operator.nama,
      categoryId: category.id,
      unitId: unit.id,
      kecamatanId: kecamatan.id,
    },
    create: {
      kode: "SEED-P-001",
      nama: "Peningkatan Jalan Desa Seed",
      namaKegiatan: "Peningkatan Jalan Desa Seed",
      kategori: "Infrastruktur Jalan",
      categoryId: category.id,
      lokasi: "Desa Cisantana, Kecamatan Kuningan",
      kecamatan: kecamatan.nama,
      kecamatanId: kecamatan.id,
      desaKelurahan: "Cisantana",
      detailLokasi: "Ruas jalan utama desa",
      pj: operator.nama,
      operatorPengelola: operator.nama,
      operatorPengelolaId: operator.id,
      penanggungJawabDinas: admin.nama,
      periode: "2026",
      jadwal: "Januari - Desember 2026",
      satuan: "KM",
      unitId: unit.id,
      targetAwal: 10,
      target: 10,
      targetVolume: 10,
      realisasi: 2,
      realisasiVolume: 2,
      status: "SEDANG_DIKERJAKAN",
      update: "Seed data untuk pengujian API",
      sumber: "Seed development",
      catatan: "Data ini dibuat untuk pengujian backend.",
      pagu: 1000000000,
      penggunaan: 200000000,
      penggunaanBiaya: 200000000,
      tanggalMulai: new Date("2026-01-15"),
    },
  });

  await prisma.programHistory.upsert({
    where: { id: 900001 },
    update: { programId: program.id, inputById: operator.id },
    create: {
      id: 900001,
      programId: program.id,
      tanggal: new Date("2026-02-01"),
      tahap: "Pelaksanaan awal",
      nilai: 2,
      satuan: "KM",
      keterangan: "Progress awal dari seed.",
      penginput: operator.nama,
      inputById: operator.id,
      status: "SEDANG_DIKERJAKAN",
    },
  });

  await prisma.programCost.upsert({
    where: { id: 900001 },
    update: { programId: program.id, inputById: operator.id },
    create: {
      id: 900001,
      programId: program.id,
      tanggal: new Date("2026-02-05"),
      uraian: "Material awal",
      nominal: 200000000,
      input: operator.nama,
      inputById: operator.id,
      bukti: true,
    },
  });

  const survey = await prisma.fieldSurvey.upsert({
    where: { kodeSurvey: "SEED-S-001" },
    update: { surveyorId: operator.id, kecamatanId: kecamatan.id },
    create: {
      id: "seed-survey-001",
      kodeSurvey: "SEED-S-001",
      tanggal: new Date("2026-01-10"),
      surveyor: operator.nama,
      surveyorId: operator.id,
      namaKegiatan: "Survey Jalan Desa Seed",
      kategori: "Infrastruktur Jalan",
      kecamatan: kecamatan.nama,
      kecamatanId: kecamatan.id,
      desaKelurahan: "Cilimus",
      detailLokasi: "Ruas jalan desa",
      kondisi: "RUSAK_RINGAN",
      panjang: 3,
      lebar: 4,
      luasVolume: 12,
      satuan: "KM",
      estimasiBiaya: 300000000,
      tingkatUrgensi: "SEDANG",
      uraianTemuan: "Permukaan jalan membutuhkan perbaikan.",
      rekomendasi: "Masukkan ke daftar prioritas.",
      status: "DRAFT",
    },
  });

  await prisma.adviceRecord.upsert({
    where: { id: "seed-advice-001" },
    update: { pimpinanId: pimpinan.id, operatorId: operator.id },
    create: {
      id: "seed-advice-001",
      idKegiatan: program.id,
      namaKegiatan: program.nama,
      identitasPimpinan: pimpinan.nama,
      pimpinanId: pimpinan.id,
      operatorPenerima: operator.nama,
      operatorId: operator.id,
      isi: "Pastikan dokumentasi progres diperbarui setiap tahap.",
      tanggal: new Date("2026-02-10"),
      status: "Belum ditindaklanjuti",
    },
  });

  await prisma.auditLog.upsert({
    where: { id: "seed-audit-001" },
    update: {},
    create: {
      id: "seed-audit-001",
      userId: admin.id,
      action: "SEED",
      entity: "Program",
      entityId: String(program.id),
      details: { source: "development-seed", surveyId: survey.id },
    },
  });

  console.log("Development seed complete.");
  console.log("Users: admin@kp.local, operator@kp.local, pimpinan@kp.local");
  console.log(`Password: ${password}`);
  console.log(`Program: ${program.kode} (${program.id})`);
  console.log(`Survey: ${survey.kodeSurvey} (${survey.id})`);
}

main()
  .catch((error) => {
    console.error("Development seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
