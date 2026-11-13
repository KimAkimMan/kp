import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http/api-error";
import { getStorage } from "@/lib/storage";

export type SurveyPhotoInput = {
  surveyId: string;
  uploadedById?: number;
  caption?: string;
  latitude?: number;
  longitude?: number;
  file: File;
};

export const surveyPhotoRepository = {
  async list(surveyId: string) {
    const survey = await prisma.fieldSurvey.findFirst({
      where: { id: surveyId, deletedAt: null },
      select: { id: true },
    });
    if (!survey) throw new ApiError("SURVEY_NOT_FOUND", "Survey tidak ditemukan.", 404);

    return prisma.surveyPhoto.findMany({
      where: { surveyId },
      include: {
        uploadedBy: { select: { id: true, nama: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    const photo = await prisma.surveyPhoto.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, nama: true } },
      },
    });
    if (!photo) throw new ApiError("PHOTO_NOT_FOUND", "Foto tidak ditemukan.", 404);
    return photo;
  },

  async addPhoto(input: SurveyPhotoInput) {
    const survey = await prisma.fieldSurvey.findFirst({
      where: { id: input.surveyId, deletedAt: null },
    });
    if (!survey) throw new ApiError("SURVEY_NOT_FOUND", "Survey tidak ditemukan.", 404);

    const storage = getStorage();
    const storageKey = `surveys/${input.surveyId}/photos/${Date.now()}_${input.file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const arrayBuffer = await input.file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await storage.upload({
      key: storageKey,
      contentType: input.file.type,
      body: buffer,
      metadata: {
        originalName: input.file.name,
        surveyId: input.surveyId,
        uploadedAt: new Date().toISOString(),
      },
    });

    return prisma.surveyPhoto.create({
      data: {
        surveyId: input.surveyId,
        storageKey,
        originalName: input.file.name,
        mimeType: input.file.type,
        fileSize: input.file.size,
        caption: input.caption ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        uploadedById: input.uploadedById ?? null,
      },
      include: {
        uploadedBy: { select: { id: true, nama: true } },
      },
    });
  },

  async deletePhoto(id: string) {
    const photo = await this.findById(id);
    const storage = getStorage();
    try {
      await storage.delete(photo.storageKey);
    } catch {
      // Abaikan error delete dari storage
    }

    return prisma.surveyPhoto.delete({
      where: { id },
    });
  },
};
