import {
  optionalString,
  parseJsonObject,
  requiredString,
} from "@/lib/validation";
import { ApiError } from "@/lib/http/api-error";
import type { CreateUserInput } from "./user.types";

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
    passwordHash: optionalString(input, "passwordHash"),
  };
}
