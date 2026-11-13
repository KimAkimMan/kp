import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parsePositiveId } from "@/lib/http/request";
import { programAssignmentService } from "@/modules/programs/program-assignment.service";

type Context = { params: Promise<{ id: string; assignmentId: string }> };

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const { assignmentId } = await context.params;
    const user = await requireRole("OPERATOR");
    const assignmentIdNum = parsePositiveId(assignmentId);
    const result = await programAssignmentService.accept(
      assignmentIdNum,
      user.id,
    );
    return successResponse(result, 200);
  });
}

export async function PATCH(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const { assignmentId } = await context.params;
    const user = await requireUser();
    const assignmentIdNum = parsePositiveId(assignmentId);
    const body = await request.json();
    const { action } = body;

    if (user.role === "OPERATOR") {
      // Operator hanya dapat release assignment miliknya
      if (action !== "release") {
        throw new Error("Operator hanya dapat melepass assignment.");
      }
      const result = await programAssignmentService.release(
        assignmentIdNum,
        user.id,
        false,
      );
      return successResponse(result);
    }

    // Admin dapat release
    if (action !== "release") {
      throw new Error("Action tidak valid.");
    }
    const result = await programAssignmentService.release(
      assignmentIdNum,
      user.id,
      true,
    );
    return successResponse(result);
  });
}

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN");
    const { assignmentId } = await context.params;
    const result = await programAssignmentService.delete(
      parsePositiveId(assignmentId),
      user,
    );
    return successResponse(result);
  });
}
