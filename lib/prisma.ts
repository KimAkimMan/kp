import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseConfig } from "@/lib/config";

const database = getDatabaseConfig();
const adapter = new PrismaMariaDb({
  ...database,
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });