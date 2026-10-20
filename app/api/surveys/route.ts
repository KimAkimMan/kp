import { errorResponse, successResponse } from "@/lib/http/api-response";
import { surveyService } from "@/modules/surveys/survey.service";

export async function GET() {
  try {
    return successResponse(await surveyService.list());
  } catch (error) {
    return errorResponse(error);
  }
}
