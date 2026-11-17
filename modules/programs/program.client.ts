import { apiClient, type ApiResponse, type PaginatedResponse } from "@/lib/api/client";
import type {
  ApiProgram,
  CreateCostInput,
  CreateProgressInput,
  ProgramFilters,
  ConvertSurveyInput,
  CreateProgramInput,
  UpdateProgramInput,
  PublicProgram,
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
  public() {
    return apiClient.get<{ data: PublicProgram[]; meta: { page: number; pageSize: number; skip: number; total: number; totalPages: number } }>("/public/programs");
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
  history(id: number) { return apiClient.get<ApiResponse<unknown[]>>(`/programs/${id}/history`); },
  progress(id: number) { return apiClient.get<ApiResponse<unknown[]>>(`/programs/${id}/progress`); },
  costs(id: number) { return apiClient.get<ApiResponse<unknown[]>>(`/programs/${id}/costs`); },
  assignments(id: number) { return apiClient.get<ApiResponse<unknown[]>>(`/programs/${id}/assignments`); },
  assign(id: number, input: { operatorId: number; notes?: string }) { return apiClient.post<ApiResponse<unknown>>(`/programs/${id}/assignments`, input); },
  acceptAssignment(programId: number, assignmentId: number) { return apiClient.post<ApiResponse<unknown>>(`/programs/${programId}/assignments/${assignmentId}`); },
  releaseAssignment(programId: number, assignmentId: number) { return apiClient.patch<ApiResponse<unknown>>(`/programs/${programId}/assignments/${assignmentId}`, { action: "release" }); },
  removeAssignment(programId: number, assignmentId: number) { return apiClient.delete<ApiResponse<unknown>>(`/programs/${programId}/assignments/${assignmentId}`); },
  verifyProgress(id: number, input: { decision: "APPROVED" | "REJECTED"; rejectionReason?: string }) { return apiClient.patch<ApiResponse<unknown>>(`/progress/${id}/verify`, input); },
  verifyCost(id: number, input: { decision: "APPROVED" | "REJECTED"; rejectionReason?: string }) { return apiClient.patch<ApiResponse<unknown>>(`/costs/${id}`, input); },
  costDocuments(costId: number) { return apiClient.get<ApiResponse<unknown[]>>(`/costs/${costId}`); },
  uploadCostDocument(costId: number, file: File) { const body = new FormData(); body.append("file", file); return apiClient.request<ApiResponse<unknown>>(`/costs/${costId}`, { method: "POST", body }); },
  removeCostDocument(costId: number, documentId: string) { return apiClient.delete<ApiResponse<unknown>>(`/costs/${costId}/documents/${encodeURIComponent(documentId)}`); },
};

export type { ConvertSurveyInput };
