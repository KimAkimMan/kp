import { NextRequest } from "next/server";
import { handleRoute } from "@/lib/http/route-handler";
import { successResponse } from "@/lib/http/api-response";
import { requireUser } from "@/modules/auth/auth.context";
import { getStorage, generateStorageKey, validateFileUpload, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES, UploadResult } from "@/lib/storage";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    await requireUser();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "image";
    const prefix = (formData.get("prefix") as string) || "uploads";

    if (!file) {
      throw new Error("File tidak ditemukan dalam form data");
    }

    // Validasi tipe file
    const allowedTypes = type === "document" ? ALLOWED_DOCUMENT_TYPES : ALLOWED_IMAGE_TYPES;
    validateFileUpload({ type: file.type, size: file.size }, allowedTypes);

    // Generate storage key
    const storageKey = generateStorageKey(prefix, file.name);

    // Upload ke storage provider
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storage = getStorage();
    const result = await storage.upload({
      key: storageKey,
      contentType: file.type,
      body: buffer,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    const uploadResult: UploadResult = {
      storageKey: result.storageKey,
      url: result.url,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    };

    return successResponse(uploadResult, 201);
  });
}

// Endpoint untuk mendapatkan presigned URL (untuk direct upload dari client)
export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    await requireUser();

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const contentType = searchParams.get("contentType");
    const expiresIn = Number(searchParams.get("expiresIn") ?? 3600);

    if (!key || !contentType) {
      throw new Error("Parameter key dan contentType wajib diisi");
    }

    const storage = getStorage();
    if (!storage.getPresignedUploadUrl) {
      throw new Error("Provider storage tidak mendukung presigned URL");
    }

    const { uploadUrl } = await storage.getPresignedUploadUrl({
      key,
      contentType,
      expiresInSeconds: expiresIn,
    });

    return successResponse({ uploadUrl, key });
  });
}