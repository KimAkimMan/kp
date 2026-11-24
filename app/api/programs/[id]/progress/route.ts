import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { parsePositiveId, parseRequestBody } from "@/lib/http/request";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseProgressInput } from "@/modules/programs/program.action.schema";
import { parseDirectUploadInput, parseCompletedUploadInput } from "@/modules/storage/direct-upload.service";
import { programActions } from "@/modules/programs/program.actions";
import { programProgressService } from "@/modules/programs/program-progress.service";
import { programService } from "@/modules/programs/program.service";
import { operationRateLimiter } from "@/modules/auth/rate-limit";
import { ApiError } from "@/lib/http/api-error";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const programId = parsePositiveId((await context.params).id);
    const result = await programProgressService.list(programId, user as AuthenticatedUser);
    return successResponse(result);
  });
}

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(
    async () => {
      const user = await requireRole("ADMIN", "OPERATOR");
      const rateLimit = await operationRateLimiter.check(request, user.id);
      if (!rateLimit.allowed) {
        throw new ApiError("RATE_LIMITED", "Terlalu banyak request. Coba lagi nanti.", 429);
      }
      const programId = parsePositiveId((await context.params).id);
      const body = (await parseRequestBody(request)) as Record<string, unknown>;
      const action = body.action;

      // 1. Presign upload URL untuk foto progres (direct ke object storage, bypass server)
      if (action === "presign") {
        await programService.assertCanEdit(programId, user);
        const input = parseDirectUploadInput(body);
        return successResponse(
          await programProgressService.presignDirect(programId, input, user),
        );
      }

      // 2. Tandai upload foto selesai, simpan metadata ke database
      if (action === "complete") {
        await programService.assertCanEdit(programId, user);
        const input = parseCompletedUploadInput(body);
        const raw = body as Record<string, unknown>;
        return successResponse(
          await programProgressService.completeDirect(
            programId,
            {
              ...input,
              caption: typeof raw.caption === "string" ? raw.caption.trim() : null,
            },
            user,
          ),
          201,
        );
      }

      // 3. Default: buat laporan progres baru
      await programService.assertCanEdit(programId, user);
      const result = await programActions.addProgress(
        programId,
        parseProgressInput(body),
        user.id,
        user.nama,
      );
      return successResponse(result, 201);
    },
    undefined,
    { idempotencyScope: { method: "POST", path: "/api/programs/[id]/progress" } },
  );
}
