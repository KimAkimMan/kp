import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/lib/http/api-response";
import { parseCreateProgramInput } from "@/modules/programs/program.schema";
import { programService } from "@/modules/programs/program.service";

export async function GET() {
  try {
    return successResponse(await programService.list());
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = parseCreateProgramInput(await request.json());
    return successResponse(await programService.create(input), 201);
  } catch (error) {
    return errorResponse(error);
  }
}
