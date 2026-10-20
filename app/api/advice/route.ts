import { NextRequest } from "next/server";
import { successResponse } from "@/lib/http/api-response";
import { adviceService } from "@/modules/advice/advice.service";
import { handleRoute } from "@/lib/http/route-handler";
import { requireRole, requireUser } from "@/modules/auth/auth.context";
import { parseRequestBody } from "@/lib/http/request";
import { parseCreateAdviceInput } from "@/modules/advice/advice.schema";

export async function GET() {
  return handleRoute(async () => {
    await requireUser();
    return successResponse(await adviceService.list());
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireRole("PIMPINAN");
    const input = parseCreateAdviceInput(await parseRequestBody(request));
    input.pimpinanId = user.id;
    input.identitasPimpinan = user.nama;
    return successResponse(await adviceService.create(input), 201);
  });
}
