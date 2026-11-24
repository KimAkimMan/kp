import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/modules/auth/auth.crypto";
import { UserRole } from "@/generated/prisma/client";

const password = process.env.SEED_LOGIN_PASSWORD ?? "Password123!";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed demo tidak diizinkan dijalankan saat NODE_ENV=production.");
  }
  const passwordHash = await hashPassword(password);

  const [admin, operator, pimpinan] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@kp.local" },
      update: {
        nama: "Admin KP",
        role: UserRole.ADMIN,
        passwordHash,
        isActive: true,
        deletedAt: null,
      },
      create: {
        nama: "Admin KP",
        email: "admin@kp.local",
        role: UserRole.ADMIN,
        passwordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "operator@kp.local" },
      update: {
        nama: "Operator KP",
        role: UserRole.OPERATOR,
        passwordHash,
        isActive: true,
        deletedAt: null,
      },
      create: {
        nama: "Operator KP",
        email: "operator@kp.local",
        role: UserRole.OPERATOR,
        passwordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "pimpinan@kp.local" },
      update: {
        nama: "Pimpinan KP",
        role: UserRole.PIMPINAN,
        passwordHash,
        isActive: true,
        deletedAt: null,
      },
      create: {
        nama: "Pimpinan KP",
        email: "pimpinan@kp.local",
        role: UserRole.PIMPINAN,
        passwordHash,
      },
    }),
  ]);

  // Seed reference data
  const categories = [
    { nama: "Jalan Lingkungan", urutan: 1 },
    { nama: "Drainase/TPT", urutan: 2 },
    { nama: "Konstruksi Lainnya", urutan: 3 },
  ];
  for (const c of categories) {
    await prisma.programCategory.upsert({
      where: { nama: c.nama },
      update: c,
      create: c,
    });
  }

  const units = [
    { nama: "Meter", satuan: "m'", urutan: 1 },
    { nama: "Meter Persegi", satuan: "m2", urutan: 2 },
    { nama: "Meter Kubik", satuan: "m3", urutan: 3 },
    { nama: "Unit", satuan: "Unit", urutan: 4 },
    { nama: "Hektar", satuan: "ha", urutan: 5 },
  ];
  for (const u of units) {
    await prisma.unit.upsert({
      where: { nama: u.nama },
      update: u,
      create: u,
    });
  }

  const periods = [
    { nama: "Januari–Desember 2024", tahun: 2024, urutan: 1 },
    { nama: "Januari–Desember 2025", tahun: 2025, urutan: 2 },
    { nama: "Januari–Desember 2026", tahun: 2026, urutan: 3 },
    { nama: "Januari–Desember 2027", tahun: 2027, urutan: 4 },
  ];
  for (const p of periods) {
    await prisma.period.upsert({
      where: { nama_tahun: { nama: p.nama, tahun: p.tahun } },
      update: p,
      create: p,
    });
  }

  const kecamatans = [
    "Ciawigebang", "Cibeureum", "Cibingbin", "Cidahu", "Cigandamekar",
    "Cigugur", "Cilebak", "Cilimus", "Cimahi", "Ciniru",
    "Cipicung", "Ciwaru", "Darma", "Garawangi", "Hantara",
    "Jalaksana", "Japara", "Kadugede", "Kalimanggis", "Kramatmulya",
    "Kuningan", "Lebakwangi", "Luragung", "Maleber", "Mandirancan",
    "Nusaherang", "Pancalang", "Pasawahan", "Selajambe", "Sindangagung",
    "Subang",
  ];
  for (const k of kecamatans) {
    await prisma.kecamatan.upsert({
      where: { nama: k },
      update: { nama: k },
      create: { nama: k },
    });
  }

  // Sample villages for first few kecamatans
  const villages: Record<string, string[]> = {
    "Ciawigebang": ["Desa Ciawigebang", "Desa Cibuntu", "Desa Cikeusik"],
    "Cigugur": ["Kelurahan Cigugur", "Desa Cisantana", "Desa Babakan"],
    "Kadugede": ["Desa Kertawinangun", "Desa Babatan", "Desa Cisewu"],
  };
  for (const [kec, vills] of Object.entries(villages)) {
    const kecRecord = await prisma.kecamatan.findUnique({ where: { nama: kec } });
    if (kecRecord) {
      for (const v of vills) {
        await prisma.village.upsert({
          where: { kecamatanId_nama: { kecamatanId: kecRecord.id, nama: v } },
          update: { nama: v, kecamatanId: kecRecord.id },
          create: { nama: v, kecamatanId: kecRecord.id },
        });
      }
    }
  }

  // Seed sample programs
  const jlCategory = await prisma.programCategory.findUnique({ where: { nama: "Jalan Lingkungan" } });
  const unitMeter = await prisma.unit.findUnique({ where: { nama: "Meter" } });
  const period2026 = await prisma.period.findUnique({ where: { nama_tahun: { nama: "Januari–Desember 2026", tahun: 2026 } } });
  const kecCigugur = await prisma.kecamatan.findUnique({ where: { nama: "Cigugur" } });
  const desCisantana = await prisma.village.findFirst({ where: { nama: "Desa Cisantana", kecamatanId: kecCigugur?.id } });

  if (jlCategory && unitMeter && period2026 && kecCigugur && desCisantana) {
    await prisma.program.upsert({
      where: { kode: "PKP-2026-001" },
      update: {},
      create: {
        kode: "PKP-2026-001",
        nama: "Perbaikan Jalan Lingkungan Cisantana",
        namaKegiatan: "Perbaikan Jalan Lingkungan Cisantana",
        kategori: jlCategory.nama,
        categoryId: jlCategory.id,
        lokasi: "Jalan Desa Cisantana, RT 02 RW 01",
        kecamatan: kecCigugur.nama,
        kecamatanId: kecCigugur.id,
        desaKelurahan: desCisantana.nama,
        villageId: desCisantana.id,
        detailLokasi: "Jalan Desa Cisantana RT 02",
        satuan: unitMeter.nama,
        unitId: unitMeter.id,
        target: 500,
        targetAwal: 500,
        targetVolume: 500,
        realisasi: 0,
        realisasiVolume: 0,
        status: "BELUM_DIKERJAKAN",
        periode: period2026.nama,
        periodId: period2026.id,
        pagu: 100000000,
        penggunaan: 0,
        penggunaanBiaya: 0,
        operatorPengelolaId: operator.id,
        operatorPengelola: operator.nama,
        createdById: admin.id,
        update: new Date().toISOString(),
        sumber: "Seeder",
        catatan: "Program contoh dari seeder",
      },
    });
  }

  console.log("Seed login roles complete.");
  console.log("Users:");
  console.log(`  1. admin@kp.local    (Role: ADMIN)`);
  console.log(`  2. operator@kp.local (Role: OPERATOR)`);
  console.log(`  3. pimpinan@kp.local (Role: PIMPINAN)`);
  console.log(`Password: ${password}`);
  console.log("Reference data seeded: categories, units, periods, kecamatans, villages");
  console.log("Sample program created.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });