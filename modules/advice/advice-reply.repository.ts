import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http/api-error";

export type AdviceReplyInput = {
  adviceId: string;
  authorId: number;
  isi: string;
};

export const adviceReplyRepository = {
  async list(adviceId: string) {
    const advice = await prisma.adviceRecord.findFirst({
      where: { id: adviceId },
      select: { id: true },
    });
    if (!advice) throw new ApiError("ADVICE_NOT_FOUND", "Arahan tidak ditemukan.", 404);

    return prisma.adviceReply.findMany({
      where: { adviceId },
      include: {
        author: { select: { id: true, nama: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  async create(input: AdviceReplyInput) {
    const advice = await prisma.adviceRecord.findFirst({
      where: { id: input.adviceId },
      select: { id: true },
    });
    if (!advice) throw new ApiError("ADVICE_NOT_FOUND", "Arahan tidak ditemukan.", 404);

    const author = await prisma.user.findUnique({
      where: { id: input.authorId },
      select: { id: true, nama: true, role: true },
    });
    if (!author) throw new ApiError("USER_NOT_FOUND", "Pengguna tidak ditemukan.", 404);

    return prisma.adviceReply.create({
      data: {
        adviceId: input.adviceId,
        authorId: input.authorId,
        isi: input.isi,
      },
      include: {
        author: { select: { id: true, nama: true, role: true } },
      },
    });
  },

  async delete(id: string, userId: number, userRole: string) {
    const reply = await prisma.adviceReply.findUnique({
      where: { id },
    });
    if (!reply) throw new ApiError("REPLY_NOT_FOUND", "Balasan tidak ditemukan.", 404);

    if (userRole !== "ADMIN" && reply.authorId !== userId) {
      throw new ApiError("FORBIDDEN", "Anda bukan pemilik balasan ini.", 403);
    }

    return prisma.adviceReply.delete({ where: { id } });
  },
};