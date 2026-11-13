import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { surveyProgramLinkService } from "@/modules/surveys/survey-program-link.service";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

type Context = { params: Promise<{ id: string; linkId?: string }> };

export async function GET(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireUser();
    const surveyId = (await context.params).id;
    const result = await surveyProgramLinkService.list(surveyId, user as AuthenticatedUser);
    return successResponse(result);
  });
}

export async function POST(request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN");
    const surveyId = (await context.params).id;
    const body = await request.json();
    const { programId, relationType } = body;

    if (!programId || typeof programId !== "number") {
      throw new Error("programId wajib diisi.");
    }

    const result = await surveyProgramLinkService.create(
      surveyId,
      { programId, relationType },
      user as AuthenticatedUser,
    );
    return successResponse(result, 201);
  });
}

export async function DELETE(_request: NextRequest, context: Context) {
  return handleRoute(async () => {
    const user = await requireRole("ADMIN");
    const { id, linkId } = await context.params;
    const result = await surveyProgramLinkService.delete(linkId, user as AuthenticatedUser);
    return successResponse(result);
  });
}