import { Prisma } from "@/generated/prisma/client";

export function serializeDecimal(value: Prisma.Decimal | number | null): number | null {
  if (value === null) return null;
  return Number(value);
}

export function serializeDate(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

export function serializePrismaValue<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, currentValue: unknown) => {
      if (currentValue instanceof Prisma.Decimal) return Number(currentValue);
      if (currentValue instanceof Date) return currentValue.toISOString();
      return currentValue;
    }),
  ) as T;
}
