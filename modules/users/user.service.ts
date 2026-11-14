import { ApiError } from "@/lib/http/api-error";
import { hashPassword } from "@/modules/auth/auth.crypto";
import { userRepository } from "./user.repository";
import type { CreateUserInput, UpdateUserInput } from "./user.types";

export type UserListFilters = {
  search?: string;
  role?: "Admin" | "Operator" | "Pimpinan";
  pagination?: { skip: number; pageSize: number };
};

export const userService = {
  list(filters?: UserListFilters) {
    return userRepository.findMany(filters);
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

    return userRepository.create({
      ...input,
      password: await hashPassword(input.password),
    });
  },

  async get(id: number) {
    const user = await userRepository.findById(id);
    if (!user) throw new ApiError("USER_NOT_FOUND", "Pengguna tidak ditemukan.", 404);
    return user;
  },

  async update(id: number, input: UpdateUserInput) {
    await this.get(id);
    if (input.email !== undefined) {
      const existing = await userRepository.findByEmail(input.email);
      if (existing && existing.id !== id) {
        throw new ApiError("USER_EMAIL_EXISTS", "Email pengguna sudah terdaftar.", 409);
      }
    }
    return userRepository.update(id, {
      ...input,
      ...(input.password === undefined
        ? {}
        : { password: await hashPassword(input.password) }),
    });
  },

  async remove(id: number) {
    await this.get(id);
    return userRepository.delete(id);
  },
};
