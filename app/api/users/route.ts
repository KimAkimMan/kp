import { NextRequest } from "next/server";
import { successResponse } from "@/lib/http/api-response";
import { parseCreateUserInput } from "@/modules/users/user.schema";
import { userService } from "@/modules/users/user.service";
import { requireRole } from "@/modules/auth/auth.context";
import { handleRoute } from "@/lib/http/route-handler";
import { parseRequestBody } from "@/lib/http/request";

export async function GET() {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    return successResponse(await userService.list());
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    await requireRole("ADMIN");
    const input = parseCreateUserInput(await parseRequestBody(request));
    return successResponse(await userService.create(input), 201);
  });
}
