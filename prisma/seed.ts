import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/modules/auth/auth.crypto";
import { UserRole } from "@/generated/prisma/client";

const password = process.env.SEED_LOGIN_PASSWORD ?? "Password123!";

async function main() {
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

  console.log("Seed login roles complete.");
  console.log("Users:");
  console.log(`  1. admin@kp.local    (Role: ADMIN)`);
  console.log(`  2. operator@kp.local (Role: OPERATOR)`);
  console.log(`  3. pimpinan@kp.local (Role: PIMPINAN)`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
