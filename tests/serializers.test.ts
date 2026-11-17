import { describe, expect, it } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { serializePrismaValue } from "@/lib/serializers";

describe("serializePrismaValue", () => {
  it("converts Decimal values to numbers", () => {
    const serialized = serializePrismaValue({
      target: new Prisma.Decimal("10000.500"),
      pagu: new Prisma.Decimal("1000000000"),
    });

    expect(serialized).toEqual({ target: 10000.5, pagu: 1000000000 });
    expect(typeof serialized.target).toBe("number");
  });

  it("converts dates to ISO strings and keeps nested structures", () => {
    const serialized = serializePrismaValue({
      updatedAt: new Date("2026-02-01T00:00:00.000Z"),
      items: [{ nilai: new Prisma.Decimal("2.5") }],
      empty: null,
    });

    expect(serialized).toEqual({
      updatedAt: "2026-02-01T00:00:00.000Z",
      items: [{ nilai: 2.5 }],
      empty: null,
    });
  });
});
