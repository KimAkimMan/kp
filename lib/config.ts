import { ApiError } from "@/lib/http/api-error";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} wajib dikonfigurasi.`);
  return value;
}

export function getDatabaseConfig() {
  const port = Number(process.env.DATABASE_PORT ?? 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("DATABASE_PORT harus berupa port TCP yang valid.");
  }
  return {
    host: required("DATABASE_HOST"),
    port,
    user: required("DATABASE_USER"),
    password: process.env.DATABASE_PASSWORD ?? "",
    database: required("DATABASE_NAME"),
  };
}

export function getJwtSecret(): string {
  const value = required("JWT_SECRET");
  if (value.length < 32) throw new Error("JWT_SECRET harus minimal 32 karakter.");
  return value;
}

export function validateRuntimeConfig() {
  getDatabaseConfig();
  getJwtSecret();
  required("APP_ORIGIN");
}

export function getHealthConfigError(error: unknown) {
  return new ApiError(
    "CONFIGURATION_ERROR",
    error instanceof Error ? error.message : "Konfigurasi server tidak valid.",
    503,
  );
}
