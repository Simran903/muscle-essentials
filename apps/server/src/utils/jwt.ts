import jwt, { type SignOptions } from "jsonwebtoken";
import type { UserRole } from "database";
import { getEnv } from "../config/env.js";

export type AccessTokenPayload = {
  sub: string;
  sid: string;
  role: UserRole;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  const env = getEnv();
  return jwt.sign(
    { sub: payload.sub, sid: payload.sid, role: payload.role },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions["expiresIn"],
    },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const env = getEnv();
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
  const sub = decoded.sub;
  const sid = decoded.sid;
  const role = decoded.role as UserRole | undefined;
  if (typeof sub !== "string" || typeof sid !== "string" || !role) {
    throw new Error("Invalid access token payload");
  }
  return { sub, sid, role };
}
