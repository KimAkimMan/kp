import { randomUUID } from "node:crypto";
import { ApiError } from "@/lib/http/api-error";
import { parseJsonObject, requiredString } from "@/lib/validation";
import {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  generateStorageKey,
  getStorage,
  validateFileUpload,
} from "@/lib/storage";

export type DirectUploadInput = {
  originalName: string;
  mimeType: string;
  fileSize: number;
};

export type CompletedUpload = DirectUploadInput & {
  storageKey: string;
};

export function parseDirectUploadInput(value: unknown): DirectUploadInput {
  const input = parseJsonObject(value);
  const fileSize = input.fileSize;
  if (typeof fileSize !== "number") {
    throw new ApiError("VALIDATION_ERROR", "Field fileSize wajib berupa angka.", 400);
  }
  return {
    originalName: requiredString(input, "originalName"),
    mimeType: requiredString(input, "mimeType"),
    fileSize,
  };
}

export function parseCompletedUploadInput(value: unknown): CompletedUpload {
  const input = parseJsonObject(value);
  return {
    ...parseDirectUploadInput(value),
    storageKey: requiredString(input, "storageKey"),
  };
}

function validateInput(input: DirectUploadInput, allowedTypes: string[]) {
  if (!input.originalName || input.originalName.trim().length > 255) {
    throw new ApiError("VALIDATION_ERROR", "Nama file wajib diisi dan maksimal 255 karakter.", 400);
  }
  if (!Number.isSafeInteger(input.fileSize) || input.fileSize < 1) {
    throw new ApiError("VALIDATION_ERROR", "Ukuran file harus berupa bilangan bulat positif.", 400);
  }
  validateFileUpload({ type: input.mimeType, size: input.fileSize }, allowedTypes);
}

function extension(originalName: string) {
  const ext = originalName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return ext && ext.length <= 10 ? ext : "bin";
}

export function allowedTypesFor(kind: "image" | "document") {
  return kind === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;
}

export async function presignDirectUpload(
  prefix: string,
  input: DirectUploadInput,
  kind: "image" | "document",
) {
  validateInput(input, allowedTypesFor(kind));
  const storage = getStorage();
  if (!storage.getPresignedUploadUrl) {
    throw new ApiError("STORAGE_PRESIGN_UNAVAILABLE", "Storage provider tidak mendukung direct upload.", 503);
  }
  const storageKey = generateStorageKey(prefix, `${randomUUID()}.${extension(input.originalName)}`);
  const expiresInSeconds = 900;
  const result = await storage.getPresignedUploadUrl({
    key: storageKey,
    contentType: input.mimeType,
    expiresInSeconds,
  });
  return {
    uploadUrl: result.uploadUrl,
    storageKey,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    expiresInSeconds,
    contentType: input.mimeType,
  };
}

export async function completeDirectUpload(
  expectedPrefix: string,
  input: CompletedUpload,
  kind: "image" | "document",
) {
  validateInput(input, allowedTypesFor(kind));
  if (!input.storageKey.startsWith(`${expectedPrefix}/`) || input.storageKey.includes("..")) {
    throw new ApiError("INVALID_STORAGE_KEY", "Storage key tidak sesuai dengan resource tujuan.", 400);
  }
  const storage = getStorage();
  if (!storage.head) {
    throw new ApiError("STORAGE_HEAD_UNAVAILABLE", "Storage provider tidak mendukung verifikasi upload.", 503);
  }
  let metadata: { size: number; contentType?: string };
  try {
    metadata = await storage.head(input.storageKey);
  } catch {
    throw new ApiError("UPLOAD_NOT_FOUND", "File belum ditemukan di object storage.", 409);
  }
  if (metadata.size !== input.fileSize) {
    throw new ApiError("UPLOAD_SIZE_MISMATCH", "Ukuran file di object storage tidak sesuai.", 409);
  }
  if (metadata.contentType && metadata.contentType !== input.mimeType) {
    throw new ApiError("UPLOAD_TYPE_MISMATCH", "Tipe file di object storage tidak sesuai.", 409);
  }
  return input;
}

export async function presignDownload(
  storageKey: string,
  originalName: string,
  mimeType: string,
) {
  const storage = getStorage();
  if (!storage.getPresignedDownloadUrl) {
    throw new ApiError("STORAGE_DOWNLOAD_UNAVAILABLE", "Storage provider tidak mendukung private download.", 503);
  }
  const expiresInSeconds = 900;
  const safeName = originalName.replace(/["\\\r\n]/g, "_");
  const result = await storage.getPresignedDownloadUrl({
    key: storageKey,
    contentType: mimeType,
    contentDisposition: `inline; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
    expiresInSeconds,
  });
  return {
    downloadUrl: result.downloadUrl,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    expiresInSeconds,
  };
}

export { MAX_FILE_SIZE };
