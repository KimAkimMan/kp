import { adviceReplyRepository } from "./advice-reply.repository";
import type { AdviceReplyInput } from "./advice-reply.repository";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { ApiError } from "@/lib/http/api-error";

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
