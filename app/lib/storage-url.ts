"use client";

/**
 * Membangun URL publik untuk file di object storage (R2), tanpa perlu
 * memuat modul storage penuh yang menggunakan 'fs' (Node.js only).
 * Aman digunakan di komponen klien (Client Component).
 */
export function getPublicStorageUrl(storageKey: string | null | undefined): string {
  if (!storageKey) return "";
  const publicUrl =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ??
    `https://${process.env.NEXT_PUBLIC_R2_BUCKET ?? ""}.${process.env.NEXT_PUBLIC_R2_ACCOUNT_ID ?? ""}.r2.cloudflarestorage.com`;
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
