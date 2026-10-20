import {
  parseJsonObject,
  requiredString,
} from "@/lib/validation";
import { ApiError } from "@/lib/http/api-error";
import type { CreateUserInput, UpdateUserInput } from "./user.types";

const roles = new Set(["Admin", "Operator", "Pimpinan"]);

export function parseCreateUserInput(body: unknown): CreateUserInput {
  const input = parseJsonObject(body);
  const role = requiredString(input, "role");

  if (!roles.has(role)) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Role pengguna tidak valid.",
      400,
    );
  }

  return {
    nama: requiredString(input, "nama"),
    email: requiredString(input, "email").toLowerCase(),
    role: role as CreateUserInput["role"],
    password: requiredString(input, "password"),
  };
}

export function parseUpdateUserInput(body: unknown): UpdateUserInput {
  const input = parseJsonObject(body);
  const output: UpdateUserInput = {};
  if (input.nama !== undefined) output.nama = requiredString(input, "nama");
  if (input.email !== undefined) {
    output.email = requiredString(input, "email").toLowerCase();
  }
  if (input.role !== undefined) {
    const role = requiredString(input, "role");
    if (!roles.has(role)) {
      throw new ApiError("VALIDATION_ERROR", "Role pengguna tidak valid.", 400);
    }
    output.role = role as UpdateUserInput["role"];
  }
  if (input.password !== undefined) {
    output.password = requiredString(input, "password");
  }
  if (Object.keys(output).length === 0) {
    throw new ApiError("VALIDATION_ERROR", "Tidak ada data yang diubah.", 400);
  }
  return output;
}
