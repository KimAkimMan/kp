import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { serializePrismaValue } from "@/lib/serializers";
import { isApiError } from "./api-error";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data: serializePrismaValue(data) }, { status });
}

export function errorResponse(error: unknown) {
  if (isApiError(error)) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details === undefined ? {} : { details: error.details }),
        },
      },
      { status: error.status },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "Data sudah terdaftar." } },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Data tidak ditemukan." } },
        { status: 404 },
      );
    }
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan pada server.",
      },
    },
    { status: 500 },
  );
}
