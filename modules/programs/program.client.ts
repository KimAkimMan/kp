import { apiClient, type ApiResponse, type PaginatedResponse } from "@/lib/api/client";
import type {
  ApiProgram,
  CreateCostInput,
  CreateProgressInput,
  ProgramFilters,
  ConvertSurveyInput,
  CreateProgramInput,
  UpdateProgramInput,
} from "@/lib/api/types";

export const programApi = {
  list(filters?: ProgramFilters) {
    return apiClient.get<PaginatedResponse<ApiProgram>>("/programs", filters);
  },
  get(id: number) {
    return apiClient.get<ApiResponse<ApiProgram>>(`/programs/${id}`);
  },
  create(input: CreateProgramInput) {
    return apiClient.post<ApiResponse<ApiProgram>>("/programs", input);
  },
  update(id: number, input: UpdateProgramInput) {
    return apiClient.patch<ApiResponse<ApiProgram>>(`/programs/${id}`, input);
  },
  remove(id: number) {
    return apiClient.delete<ApiResponse<ApiProgram>>(`/programs/${id}`);
  },
  claim(id: number) {
    return apiClient.post<ApiResponse<ApiProgram>>(`/programs/${id}/claim`);
  },
  addProgress(id: number, input: CreateProgressInput) {
    return apiClient.post<ApiResponse<unknown>>(`/programs/${id}/progress`, input);
  },
  addCost(id: number, input: CreateCostInput) {
    return apiClient.post<ApiResponse<unknown>>(`/programs/${id}/costs`, input);
  },
  complete(id: number, input?: { foto?: boolean }) {
    return apiClient.post<ApiResponse<ApiProgram>>(`/programs/${id}/complete`, input);
  },
};

export type { ConvertSurveyInput };
