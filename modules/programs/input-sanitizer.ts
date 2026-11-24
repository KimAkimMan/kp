/**
 * Sanitasi input teks dari client untuk mencegah XSS dan injection.
 * Escape karakter HTML berbahaya sebelum disimpan ke database.
 * Gunakan pada semua field teks bebas yang diinput user (nama, keterangan, catatan, uraian, dll).
 */
export function sanitizeText(input: string | undefined | null): string | undefined | null {
  if (input === undefined || input === null) return input;
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim();
}

/**
 * Sanitasi objek input secara rekursif untuk semua properti string.
 * Memodifikasi objek langsung dan mengembalikannya.
 */
export function sanitizeInputObject(obj: Record<string, unknown>): Record<string, unknown> {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      obj[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      obj[key] = value.map((v) => (typeof v === "string" ? sanitizeText(v) : v));
    } else if (value !== null && typeof value === "object") {
      sanitizeInputObject(value as Record<string, unknown>);
    }
  }
  return obj;
}
