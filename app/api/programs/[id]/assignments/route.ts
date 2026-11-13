import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parsePositiveId } from "@/lib/http/request";
import { programAssignmentService } from "@/modules/programs/program-assignment.service";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

type Context = { params: Promise<{ id: string; assignmentId?: string }> };

export async function GET(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const programId = parsePositiveId((await context.params).id);
    const result = await programAssignmentService.list(programId, user);
    return successResponse(result);
  });
}

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN");
    const programId = parsePositiveId((await context.params).id);
    const body = await request.json();
    const { operatorId, notes } = body;

    if (!operatorId || typeof operatorId !== "number") {
      throw new Error("operatorId wajib diisi.");
    }

    const result = await programAssignmentService.create(
      programId,
      { operatorId, notes },
      user as AuthenticatedUser,
    );
    return successResponse(result, 201);
  });
}

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const { id, assignmentId } = await context.params;
    const user = await requireUser();
    const assignmentIdNum = parsePositiveId(assignmentId);

    const body = await request.json();
    const { status, notes } = body;

    if (user.role === "OPERATOR") {
      // Operator hanya dapat accept (mengubah status ke DITERIMA)
      if (status && status !== "DITERIMA") {
        throw new Error("Operator hanya dapat menerima assignment.");
      }
      const result = await programAssignmentService.accept(
        assignmentIdNum,
        user.id,
      );
      return successResponse(result);
    }

    // Admin dapat update semua field
    const result = await programAssignmentService.update(
      assignmentIdNum,
      { status, notes },
      user as AuthenticatedUser,
    );
    return successResponse(result);
  });
}

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const { id, assignmentId } = await context.params;
    const user = await requireRole("ADMIN");
    const assignmentIdNum = parsePositiveId(assignmentId);
    const result = await programAssignmentService.delete(
      assignmentIdNum,
      user as AuthenticatedUser,
    );
    return successResponse(result);
  });
}