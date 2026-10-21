import { apiClient, type ApiResponse, type PaginatedResponse } from "@/lib/api/client";
import type { ApiSurvey, ConvertSurveyInput, SurveyFilters, SurveyInput } from "@/lib/api/types";

export const surveyApi = {
  list(filters?: SurveyFilters) {
    return apiClient.get<PaginatedResponse<ApiSurvey>>("/surveys", filters);
  },
  get(id: string) {
    return apiClient.get<ApiResponse<ApiSurvey>>(`/surveys/${encodeURIComponent(id)}`);
  },
  create(input: SurveyInput) {
    return apiClient.post<ApiResponse<ApiSurvey>>("/surveys", input);
  },
  update(id: string, input: Partial<SurveyInput>) {
    return apiClient.patch<ApiResponse<ApiSurvey>>(`/surveys/${encodeURIComponent(id)}`, input);
  },
  remove(id: string) {
    return apiClient.delete<ApiResponse<ApiSurvey>>(`/surveys/${encodeURIComponent(id)}`);
  },
  verify(id: string, programId?: number | null) {
    return apiClient.post<ApiResponse<ApiSurvey>>(
      `/surveys/${encodeURIComponent(id)}/verify`,
      { programId },
    );
  },
  convert(id: string, input: ConvertSurveyInput) {
    return apiClient.post<ApiResponse<unknown>>(
      `/surveys/${encodeURIComponent(id)}/convert`,
      input,
    );
  },
};
