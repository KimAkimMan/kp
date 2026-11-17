import { Prisma } from "@/generated/prisma/client";

export function serializeDecimal(value: Prisma.Decimal | number | null): number | null {
  if (value === null) return null;
  return Number(value);
}

export function serializeDate(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

function serializeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  // `Prisma.Decimal` punya `toJSON()` yang mengembalikan string, sehingga
  // replacer `JSON.stringify` tidak pernah melihat instance Decimal. Konversi
  // dilakukan manual agar kontrak DTO (`number`) benar-benar dipenuhi.
  if (Prisma.Decimal.isDecimal(value)) return Number(value as Prisma.Decimal);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      result[key] = serializeValue(entry);
    }
    return result;
  }
  return value;
}

export function serializePrismaValue<T>(value: T): T {
  return serializeValue(value) as T;
}
