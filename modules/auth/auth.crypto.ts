import {
  createHash,
  createHmac,
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

export function createSessionId(): string {
  return randomUUID();
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

type AccessTokenClaims = {
  sub: string;
  sid: string;
  iat: number;
  exp: number;
  jti: string;
};

const JWT_ALGORITHM = "HS256";

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET harus diset dan minimal 32 karakter.");
  }
  return secret;
}

export function createAccessToken(
  userId: number,
  sessionId: string,
  expiresAt: Date,
): string {
  const header = base64Url(JSON.stringify({ alg: JWT_ALGORITHM, typ: "JWT" }));
  const payload: AccessTokenClaims = {
    sub: String(userId),
    sid: sessionId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expiresAt.getTime() / 1000),
    jti: randomUUID(),
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = `${header}.${encodedPayload}`;
  const signature = createHmac("sha256", jwtSecret())
    .update(signingInput)
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  const [header, payload, signature] = parts;
  const expected = createHmac("sha256", jwtSecret())
    .update(`${header}.${payload}`)
    .digest("base64url");
  if (signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("Invalid JWT signature");
  }

  const decodedHeader = JSON.parse(Buffer.from(header, "base64url").toString()) as { alg?: string; typ?: string };
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as AccessTokenClaims;
  if (
    decodedHeader.alg !== JWT_ALGORITHM ||
    decodedHeader.typ !== "JWT" ||
    typeof claims.sub !== "string" ||
    typeof claims.sid !== "string" ||
    typeof claims.exp !== "number" ||
    claims.exp <= Math.floor(Date.now() / 1000)
  ) {
    throw new Error("Invalid JWT claims");
  }
  return claims;
}
