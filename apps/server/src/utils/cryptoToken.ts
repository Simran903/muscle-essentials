import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

/** URL-safe random token for magic links and refresh secrets. */
export function generateMagicToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function hashToken(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyTokenHash(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
