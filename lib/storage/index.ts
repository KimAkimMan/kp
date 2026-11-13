import { ApiError } from "@/lib/http/api-error";

export interface StorageProvider {
  /**
   * Upload file dan return storage key + public URL
   */
  upload(params: {
    key: string;
    contentType: string;
    body: Buffer | ReadableStream | Blob;
    metadata?: Record<string, string>;
  }): Promise<{ storageKey: string; url: string }>;

  /**
   * Delete file by storage key
   */
  delete(key: string): Promise<void>;

  /**
   * Get presigned URL untuk direct upload dari client (optional)
   */
  getPresignedUploadUrl?(params: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<{ uploadUrl: string; key: string }>;

  /**
   * Get public URL untuk file
   */
  getPublicUrl(key: string): string;
}

export interface UploadResult {
  storageKey: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export type StorageConfig = {
  provider: "vercel-blob" | "r2" | "minio" | "local" | "mock";
  // Vercel Blob
  vercelBlobToken?: string;
  // R2 / S3-compatible
  r2AccountId?: string;
  r2AccessKeyId?: string;
  r2SecretAccessKey?: string;
  r2Bucket?: string;
  r2PublicUrl?: string;
  // MinIO
  minioEndpoint?: string;
  minioPort?: number;
  minioUseSSL?: boolean;
  minioAccessKey?: string;
  minioSecretKey?: string;
  minioBucket?: string;
  // Local filesystem (dev only)
  localUploadDir?: string;
  localPublicUrl?: string;
};

function validateConfig(config: StorageConfig): void {
  switch (config.provider) {
    case "vercel-blob":
      if (!config.vercelBlobToken) throw new Error("VERCEL_BLOB_TOKEN wajib untuk provider vercel-blob");
      break;
    case "r2":
      if (!config.r2AccountId || !config.r2AccessKeyId || !config.r2SecretAccessKey || !config.r2Bucket)
        throw new Error("R2 config tidak lengkap: accountId, accessKeyId, secretAccessKey, bucket wajib diisi");
      break;
    case "minio":
      if (!config.minioEndpoint || !config.minioAccessKey || !config.minioSecretKey || !config.minioBucket)
        throw new Error("MinIO config tidak lengkap: endpoint, accessKey, secretKey, bucket wajib diisi");
      break;
    case "local":
      if (!config.localUploadDir) throw new Error("LOCAL_UPLOAD_DIR wajib untuk provider local");
      break;
  }
}

let _provider: StorageProvider | null = null;
let _config: StorageConfig | null = null;

export function initStorage(config: StorageConfig): StorageProvider {
  validateConfig(config);
  _config = config;

  switch (config.provider) {
    case "vercel-blob":
      _provider = createVercelBlobProvider(config);
      break;
    case "r2":
      _provider = createR2Provider(config);
      break;
    case "minio":
      _provider = createMinioProvider(config);
      break;
    case "local":
      _provider = createLocalProvider(config);
      break;
    case "mock":
      _provider = createMockProvider();
      break;
    default:
      throw new Error(`Storage provider tidak dikenal: ${config.provider}`);
  }
  return _provider;
}

export function getStorage(): StorageProvider {
  if (!_provider) {
    // Auto-init dari env untuk development
    const provider = (process.env.STORAGE_PROVIDER as StorageConfig["provider"]) ?? "mock";
    const config: StorageConfig = {
      provider,
      vercelBlobToken: process.env.BLOB_READ_WRITE_TOKEN,
      r2AccountId: process.env.R2_ACCOUNT_ID,
      r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
      r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      r2Bucket: process.env.R2_BUCKET,
      r2PublicUrl: process.env.R2_PUBLIC_URL,
      minioEndpoint: process.env.MINIO_ENDPOINT,
      minioPort: Number(process.env.MINIO_PORT ?? 9000),
      minioUseSSL: process.env.MINIO_USE_SSL === "true",
      minioAccessKey: process.env.MINIO_ACCESS_KEY,
      minioSecretKey: process.env.MINIO_SECRET_KEY,
      minioBucket: process.env.MINIO_BUCKET,
      localUploadDir: process.env.LOCAL_UPLOAD_DIR ?? "./uploads",
      localPublicUrl: process.env.LOCAL_PUBLIC_URL ?? "http://localhost:3000/uploads",
    };
    return initStorage(config);
  }
  return _provider;
}

export function resetStorage(): void {
  _provider = null;
  _config = null;
}

// ============================================
// Provider Implementations
// ============================================

function createMockProvider(): StorageProvider {
  const store = new Map<string, { contentType: string; data: Buffer; metadata?: Record<string, string> }>();

  return {
    async upload({ key, contentType, body, metadata }) {
      const buffer = body instanceof Buffer ? body : Buffer.from(await new Response(body as any).arrayBuffer());
      store.set(key, { contentType, data: buffer, metadata });
      return { storageKey: key, url: `/api/mock-storage/${key}` };
    },
    async delete(key) {
      store.delete(key);
    },
    getPublicUrl(key) {
      return `/api/mock-storage/${key}`;
    },
  };
}

function createLocalProvider(config: StorageConfig): StorageProvider {
  const fs = require("fs");
  const path = require("path");
  const crypto = require("crypto");

  const uploadDir = config.localUploadDir!;
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  return {
    async upload({ key, contentType, body }) {
      const buffer = body instanceof Buffer ? body : Buffer.from(await new Response(body as any).arrayBuffer());
      const fullPath = path.join(uploadDir, key);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, buffer);
      return { storageKey: key, url: `${config.localPublicUrl}/${key}` };
    },
    async delete(key) {
      const fullPath = path.join(uploadDir, key);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    },
    getPublicUrl(key) {
      return `${config.localPublicUrl}/${key}`;
    },
  };
}

function createVercelBlobProvider(config: StorageConfig): StorageProvider {
  // Dynamic import agar tidak error jika tidak install
  let put: any;
  let del: any;
  try {
    const blob = require("@vercel/blob");
    put = blob.put;
    del = blob.del;
  } catch {
    throw new Error("@vercel/blob belum diinstall. Jalankan: npm i @vercel/blob");
  }

  return {
    async upload({ key, contentType, body }) {
      const blob = await put(key, body, {
        access: "public",
        contentType,
        token: config.vercelBlobToken,
        addRandomSuffix: false,
      });
      return { storageKey: blob.pathname, url: blob.url };
    },
    async delete(key) {
      await del(key, { token: config.vercelBlobToken });
    },
    getPublicUrl(key) {
      // Vercel Blob URL sudah full URL
      return key.startsWith("http") ? key : `https://${config.vercelBlobToken?.split("_")[2] || "blob"}.vercel-storage.com/${key}`;
    },
  };
}

function createR2Provider(config: StorageConfig): StorageProvider {
  let S3Client: any, PutObjectCommand: any, DeleteObjectCommand: any, GetObjectCommand: any, getSignedUrl: any;

  try {
    const client = require("@aws-sdk/client-s3");
    S3Client = client.S3Client;
    PutObjectCommand = client.PutObjectCommand;
    DeleteObjectCommand = client.DeleteObjectCommand;
    GetObjectCommand = client.GetObjectCommand;
    const presigner = require("@aws-sdk/s3-request-presigner");
    getSignedUrl = presigner.getSignedUrl;
  } catch {
    throw new Error("@aws-sdk/client-s3 & @aws-sdk/s3-request-presigner belum diinstall. Jalankan: npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner");
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2AccessKeyId!,
      secretAccessKey: config.r2SecretAccessKey!,
    },
  });

  const bucket = config.r2Bucket!;
  const publicUrl = config.r2PublicUrl ?? `https://${bucket}.${config.r2AccountId}.r2.cloudflarestorage.com`;

  return {
    async upload({ key, contentType, body }) {
      const buffer = body instanceof Buffer ? body : Buffer.from(await new Response(body as any).arrayBuffer());
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }));
      return { storageKey: key, url: `${publicUrl}/${key}` };
    },
    async delete(key) {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
    async getPresignedUploadUrl({ key, contentType, expiresInSeconds = 3600 }) {
      const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
      return { uploadUrl, key };
    },
    getPublicUrl(key) {
      return `${publicUrl}/${key}`;
    },
  };
}

function createMinioProvider(config: StorageConfig): StorageProvider {
  let S3Client: any, PutObjectCommand: any, DeleteObjectCommand: any, getSignedUrl: any;

  try {
    const client = require("@aws-sdk/client-s3");
    S3Client = client.S3Client;
    PutObjectCommand = client.PutObjectCommand;
    DeleteObjectCommand = client.DeleteObjectCommand;
    const presigner = require("@aws-sdk/s3-request-presigner");
    getSignedUrl = presigner.getSignedUrl;
  } catch {
    throw new Error("@aws-sdk/client-s3 & @aws-sdk/s3-request-presigner belum diinstall. Jalankan: npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner");
  }

  const endpoint = config.minioEndpoint!;
  const useSSL = config.minioUseSSL ?? false;
  const s3 = new S3Client({
    region: "us-east-1",
    endpoint: `${useSSL ? "https" : "http"}://${endpoint}`,
    credentials: {
      accessKeyId: config.minioAccessKey!,
      secretAccessKey: config.minioSecretKey!,
    },
    forcePathStyle: true,
  });

  const bucket = config.minioBucket!;
  const publicUrl = `${useSSL ? "https" : "http"}://${endpoint}/${bucket}`;

  return {
    async upload({ key, contentType, body }) {
      const buffer = body instanceof Buffer ? body : Buffer.from(await new Response(body as any).arrayBuffer());
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }));
      return { storageKey: key, url: `${publicUrl}/${key}` };
    },
    async delete(key) {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
    async getPresignedUploadUrl({ key, contentType, expiresInSeconds = 3600 }) {
      const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
      return { uploadUrl, key };
    },
    getPublicUrl(key) {
      return `${publicUrl}/${key}`;
    },
  };
}

// ============================================
// Helper functions untuk route handlers
// ============================================

export function generateStorageKey(prefix: string, originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "bin";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 100);
  return `${prefix}/${timestamp}_${random}_${safeName}`;
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileUpload(file: { type: string; size: number }, allowedTypes: string[] = ALLOWED_IMAGE_TYPES): void {
  if (!allowedTypes.includes(file.type)) {
    throw new ApiError("INVALID_FILE_TYPE", `Tipe file tidak diizinkan. Diizinkan: ${allowedTypes.join(", ")}`, 400);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError("FILE_TOO_LARGE", `Ukuran file melebihi batas ${MAX_FILE_SIZE / 1024 / 1024}MB`, 400);
  }
}