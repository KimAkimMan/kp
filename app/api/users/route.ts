import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/http/api-response";
import { parseCreateUserInput } from "@/modules/users/user.schema";
import { userService } from "@/modules/users/user.service";

export async function GET() {
  try {
    return successResponse(await userService.list());
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = parseCreateUserInput(await request.json());
    return successResponse(await userService.create(input), 201);
  } catch (error) {
    return errorResponse(error);
  }
}
