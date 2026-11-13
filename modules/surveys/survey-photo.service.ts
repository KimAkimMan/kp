import { surveyPhotoRepository } from "./survey-photo.repository";
import type { SurveyPhotoInput } from "./survey-photo.repository";
import type { AuthenticatedUser } from "@/modules/auth/auth.types";

export const surveyPhotoService = {
  async list(surveyId: string, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat melihat foto survey.");
    }
    return surveyPhotoRepository.list(surveyId);
  },

  async addPhoto(surveyId: string, input: Omit<SurveyPhotoInput, "surveyId">, user: AuthenticatedUser) {
    if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
      throw new Error("Hanya Admin dan Operator yang dapat menambahkan foto.");
    }
    return surveyPhotoRepository.addPhoto({
      surveyId,
      ...input,
      uploadedById: user.id,
    });
  },

  async deletePhoto(id: string, user: AuthenticatedUser) {
    const photo = await surveyPhotoRepository.findById(id);
    if (user.role !== "ADMIN" && photo.uploadedById !== user.id) {
      throw new Error("Hanya Admin atau pemilik foto yang dapat menghapus.");
    }
    return surveyPhotoRepository.deletePhoto(id);
  },
};