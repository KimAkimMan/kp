import { apiClient, type ApiResponse, type PaginatedResponse } from "@/lib/api/client";
import type { ApiSurvey, ConvertSurveyInput, SurveyFilters, SurveyInput } from "@/lib/api/types";

export const surveyApi = {
  list(filters?: SurveyFilters) {
    const { page, pageSize, ...rest } = filters ?? {};
    return apiClient.get<PaginatedResponse<ApiSurvey>>("/surveys", {
      page,
      pageSize,
      ...rest,
    });
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
  photos(id: string) { return apiClient.get<ApiResponse<unknown[]>>(`/surveys/${encodeURIComponent(id)}/photos`); },
  uploadPhoto(id: string, file: File, input?: { caption?: string; latitude?: number; longitude?: number }) { const body = new FormData(); body.append("file", file); if (input?.caption) body.append("caption", input.caption); if (input?.latitude !== undefined) body.append("latitude", String(input.latitude)); if (input?.longitude !== undefined) body.append("longitude", String(input.longitude)); return apiClient.request<ApiResponse<unknown>>(`/surveys/${encodeURIComponent(id)}/photos`, { method: "POST", body }); },
  removePhoto(photoId: string) { return apiClient.delete<ApiResponse<unknown>>(`/surveys/photos/${encodeURIComponent(photoId)}`); },
  reviews(id: string) { return apiClient.get<ApiResponse<unknown[]>>(`/surveys/${encodeURIComponent(id)}/reviews`); },
  statusHistory(id: string) { return apiClient.get<ApiResponse<unknown[]>>(`/surveys/${encodeURIComponent(id)}/status-history`); },
  links(id: string) { return apiClient.get<ApiResponse<unknown[]>>(`/surveys/${encodeURIComponent(id)}/links`); },
  link(id: string, input: { programId: number; relationType?: string }) { return apiClient.post<ApiResponse<unknown>>(`/surveys/${encodeURIComponent(id)}/links`, input); },
  removeLink(linkId: string) { return apiClient.delete<ApiResponse<unknown>>(`/surveys/links/${encodeURIComponent(linkId)}`); },
};
