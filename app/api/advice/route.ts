import { errorResponse, successResponse } from "@/lib/http/api-response";
import { adviceService } from "@/modules/advice/advice.service";

export async function GET() {
  try {
    return successResponse(await adviceService.list());
  } catch (error) {
    return errorResponse(error);
  }
}
