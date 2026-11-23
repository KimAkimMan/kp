import { adviceReplyRepository } from "./advice-reply.repository";
import type { AdviceReplyInput } from "./advice-reply.repository";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { ApiError } from "@/lib/http/api-error";
import { adviceRepository } from "./advice.repository";

export const adviceReplyService = {
  async list(adviceId: string, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR" && user.role !== "PIMPINAN") {
      throw new ApiError("FORBIDDEN", "Akses tidak diizinkan.", 403);
    }
    return adviceReplyRepository.list(adviceId);
  },

  async create(
    adviceId: string,
    input: Pick<AdviceReplyInput, "isi">,
    user: AuthenticatedUser,
  ) {
    // Cek advice exists dan validasi penerima
    const advice = await adviceRepository.findById(adviceId);
    if (!advice) throw new ApiError("ADVICE_NOT_FOUND", "Arahan tidak ditemukan.", 404);
    
    // Hanya operator penerima (operatorId) atau pimpinan pembuat (pimpinanId) yang bisa balas
    if (user.role === "OPERATOR") {
      if (advice.operatorId !== user.id) {
        throw new ApiError("FORBIDDEN", "Anda bukan penerima arahan ini.", 403);
      }
    } else if (user.role === "PIMPINAN") {
      if (advice.pimpinanId !== user.id) {
        throw new ApiError("FORBIDDEN", "Anda bukan pimpinan yang mengeluarkan arahan ini.", 403);
      }
    } else if (user.role !== "ADMIN") {
      throw new ApiError("FORBIDDEN", "Akses tidak diizinkan.", 403);
    }
    
    return adviceReplyRepository.create({
      adviceId,
      ...input,
      authorId: user.id,
    });
  },

  async delete(replyId: string, user: AuthenticatedUser) {
    return adviceReplyRepository.delete(replyId, user.id, user.role);
  },
};
