import { prisma } from "@/lib/prisma";

export const adviceRepository = {
  findMany() {
    return prisma.adviceRecord.findMany({
      include: { program: true, pimpinan: true, operator: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
