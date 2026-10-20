import { ApiError } from "@/lib/http/api-error";
import { userRepository } from "./user.repository";
import type { CreateUserInput } from "./user.types";

export const userService = {
  list() {
    return userRepository.findMany();
  },

  async create(input: CreateUserInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ApiError(
        "USER_EMAIL_EXISTS",
        "Email pengguna sudah terdaftar.",
        409,
      );
    }

    return userRepository.create(input);
  },
};
