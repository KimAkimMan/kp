"use client";

/**
 * Membangun URL publik untuk file di object storage (R2), tanpa perlu
 * memuat modul storage penuh yang menggunakan 'fs' (Node.js only).
 * Aman digunakan di komponen klien (Client Component).
 */
export function getPublicStorageUrl(storageKey: string | null | undefined): string {
  if (!storageKey) return "";
  const r2PublicUrl =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL;
  const r2Bucket = process.env.NEXT_PUBLIC_R2_BUCKET ?? process.env.R2_BUCKET;
  const r2AccountId =
    process.env.NEXT_PUBLIC_R2_ACCOUNT_ID ?? process.env.R2_ACCOUNT_ID;
  const publicUrl =
    r2PublicUrl ??
    (r2Bucket && r2AccountId
      ? `https://${r2Bucket}.${r2AccountId}.r2.cloudflarestorage.com`
      : undefined);
  if (!publicUrl) return "";
  return `${publicUrl}/${storageKey}`;
}

/**
 * Konversi storageKey (koma-separated) menjadi array URL publik.
 */
export function storageKeysToPublicUrls(
  storageKey: string | null | undefined,
): string[] {
  if (!storageKey) return [];
  return storageKey
    .split(",")
    .filter(Boolean)
    .map((key) => getPublicStorageUrl(key.trim()));
}
