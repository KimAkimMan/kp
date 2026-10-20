import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  encodedHash: string | null,
): Promise<boolean> {
  if (!encodedHash?.startsWith("scrypt:")) return false;
  const [, salt, encodedKey] = encodedHash.split(":");
  if (!salt || !encodedKey) return false;

  const expected = Buffer.from(encodedKey, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSessionToken(): string {
  return `${randomUUID()}${randomBytes(24).toString("hex")}`;
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
