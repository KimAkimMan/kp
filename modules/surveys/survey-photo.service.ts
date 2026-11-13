import { surveyPhotoRepository } from "./survey-photo.repository";
import { ApiError } from "@/lib/http/api-error";
import type { SurveyPhotoInput } from "./survey-photo.repository";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";
import { completeDirectUpload, presignDirectUpload, presignDownload, type DirectUploadInput } from "@/modules/storage/direct-upload.service";

export const surveyPhotoService = {
  async assertCanManage(surveyId: string, user: AuthenticatedUser) {
    const survey = await surveyPhotoRepository.assertSurvey(surveyId);
    if (user.role === "OPERATOR" && survey.surveyorId !== user.id) {
      throw new ApiError("FORBIDDEN", "Anda tidak dapat mengelola foto survey operator lain.", 403);
    }
    return survey;
  },

  async list(surveyId: string, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat melihat foto survey.");
    }
    await this.assertCanManage(surveyId, user);
    return surveyPhotoRepository.list(surveyId);
  },

  async addPhoto(surveyId: string, input: Omit<SurveyPhotoInput, "surveyId">, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat menambahkan foto.");
    }
    await this.assertCanManage(surveyId, user);
    return surveyPhotoRepository.addPhoto({
      surveyId,
      ...input,
      uploadedById: user.id,
    });
  },

  async presignDirect(surveyId: string, input: DirectUploadInput, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat menambahkan foto.");
    }
    await this.assertCanManage(surveyId, user);
    return presignDirectUpload(`surveys/${surveyId}/photos`, input, "image");
  },

  async completeDirect(
    surveyId: string,
    input: DirectUploadInput & { storageKey: string; caption?: string | null; latitude?: number | null; longitude?: number | null },
    user: AuthenticatedUser,
  ) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat menambahkan foto.");
    }
    await this.assertCanManage(surveyId, user);
    await completeDirectUpload(`surveys/${surveyId}/photos`, input, "image");
    return surveyPhotoRepository.addDirectPhoto({ surveyId, ...input, uploadedById: user.id });
  },

  async download(id: string, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat melihat foto survey.");
    }
    const photo = await surveyPhotoRepository.findById(id);
    return { photo, ...(await presignDownload(photo.storageKey, photo.originalName, photo.mimeType)) };
  },

  async deletePhoto(id: string, user: AuthenticatedUser) {
    const photo = await surveyPhotoRepository.findById(id);
    if (user.role !== "ADMIN" && photo.uploadedById !== user.id) {
      throw new Error("Hanya Admin atau pemilik foto yang dapat menghapus.");
    }
    return surveyPhotoRepository.deletePhoto(id);
  },
};
