import type { Request, Response } from "express";
import { Magic } from "@magic-sdk/admin";
import type { MagicUserMetadata } from "@magic-sdk/admin";
import { prisma, Prisma, UserRole, UserStatus } from "database";
import { getEnv } from "../config/env.js";
import { interactiveTransactionOptions } from "../config/transaction.js";
import { AppError } from "../utils/appError.js";
import {
  generateMagicToken,
  hashToken,
  verifyTokenHash,
} from "../utils/cryptoToken.js";
import { signAccessToken, verifyAccessToken } from "../utils/jwt.js";

const DEFAULT_MAGIC_ENDPOINT = "https://tee.express.magiclabs.com";

let magicSingleton: InstanceType<typeof Magic> | null = null;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function clientIp(req: Pick<Request, "ip" | "socket">): string | undefined {
  return req.ip ?? req.socket.remoteAddress ?? undefined;
}

function getMagicAdmin(): InstanceType<typeof Magic> {
  const secret = process.env.MAGIC_SECRET_KEY;
  if (!secret) {
    throw new Error("MAGIC_SECRET_KEY must be set");
  }
  if (!magicSingleton) {
    magicSingleton = new Magic(secret, {
      endpoint: process.env.MAGIC_ENDPOINT ?? DEFAULT_MAGIC_ENDPOINT,
    });
  }
  return magicSingleton;
}

async function getUserMetadataByIssuer(
  apiBaseUrl: string,
  secretKey: string,
  issuer: string,
): Promise<MagicUserMetadata> {
  const params = new URLSearchParams({ issuer });
  const url = `${apiBaseUrl}/v1/admin/user?${params.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "X-Magic-Secret-Key": secretKey },
  });
  let raw: Record<string, unknown>;
  try {
    raw = (await res.json()) as Record<string, unknown>;
  } catch {
    raw = {};
  }
  if (!res.ok) {
    if (res.status === 404) {
      return {
        issuer: null,
        publicAddress: null,
        email: null,
        oauthProvider: null,
        phoneNumber: null,
        username: null,
        wallets: null,
      };
    }
    throw new AppError(
      typeof raw.message === "string"
        ? raw.message
        : `Magic admin user lookup failed (${res.status})`,
      401,
    );
  }
  const data =
    raw.data && typeof raw.data === "object"
      ? (raw.data as Record<string, unknown>)
      : raw.user && typeof raw.user === "object"
        ? (raw.user as Record<string, unknown>)
        : raw;
  return {
    issuer: (data.issuer as string | null | undefined) ?? null,
    publicAddress: (data.public_address as string | null | undefined) ?? null,
    email:
      (data.email as string | null | undefined) ??
      (data.public_email as string | null | undefined) ??
      null,
    oauthProvider: (data.oauth_provider as string | null | undefined) ?? null,
    phoneNumber: (data.phone_number as string | null | undefined) ?? null,
    username: (data.username as string | null | undefined) ?? null,
    wallets: (data.wallets as MagicUserMetadata["wallets"]) ?? null,
  };
}

function pickEmailFromDidClaim(c: Record<string, unknown>): string | null {
  const tryKeys = [c.email, c.login_email, c.em, c.public_email, c.sub];
  for (const v of tryKeys) {
    if (typeof v === "string" && v.includes("@")) {
      return v.toLowerCase();
    }
  }
  return null;
}

export type VerifyMagicLinkResult = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    status: UserStatus;
  };
};

export async function verifyMagicDidAuth(
  req: Request,
  didToken: string,
  emailRaw?: string,
  phoneRaw?: string,
): Promise<VerifyMagicLinkResult> {
  const secret = process.env.MAGIC_SECRET_KEY;
  if (!secret) {
    throw new AppError("MAGIC_SECRET_KEY must be set", 500);
  }

  const magic = getMagicAdmin();
  let metadata: MagicUserMetadata;
  try {
    magic.token.validate(didToken);
    const issuer = magic.token.getIssuer(didToken);
    metadata = await getUserMetadataByIssuer(magic.apiBaseUrl, secret, issuer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid DID token";
    throw new AppError(message, 401);
  }

  const requestedEmail = emailRaw ? normalizeEmail(emailRaw) : null;
  let email = metadata.email ? normalizeEmail(metadata.email) : null;
  if (!email) {
    const [, claim] = magic.token.decode(didToken);
    const fallback = pickEmailFromDidClaim(claim as unknown as Record<string, unknown>);
    email = fallback ? normalizeEmail(fallback) : null;
  }
  if (!email) {
    email = requestedEmail;
  }
  if (!email) {
    throw new AppError("Email is required for DID verification", 400);
  }
  if (requestedEmail && requestedEmail !== email) {
    throw new AppError("Magic email mismatch", 401);
  }
  const phone = phoneRaw?.trim() || null;

  return prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.upsert({
        where: { email },
        create: {
          email,
          name: email.split("@")[0]?.slice(0, 120) ?? null,
          phone,
          lastLoginAt: new Date(),
        },
        update: {
          ...(phone ? { phone } : {}),
          lastLoginAt: new Date(),
        },
      });

      if (user.status === UserStatus.SUSPENDED) {
        throw new AppError("Account suspended", 403);
      }

      const refreshSecret = generateMagicToken();
      const tokenHash = await hashToken(refreshSecret);

      const refreshDays = getEnv().JWT_REFRESH_EXPIRES_DAYS;
      const session = await tx.session.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000),
          ipAddress: clientIp(req),
          userAgent: req.get("user-agent") ?? undefined,
        },
      });

      const refreshToken = `${session.id}:${refreshSecret}`;
      const accessToken = signAccessToken({
        sub: user.id,
        sid: session.id,
        role: user.role,
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        },
      };
    },
    interactiveTransactionOptions,
  );
}

export async function refreshSession(
  req: Request,
  refreshCookieValue: string | undefined,
): Promise<{ accessToken: string; refreshToken: string }> {
  if (!refreshCookieValue) {
    throw new AppError("Not authenticated", 401);
  }

  const idx = refreshCookieValue.indexOf(":");
  if (idx <= 0) {
    throw new AppError("Not authenticated", 401);
  }
  const sessionId = refreshCookieValue.slice(0, idx);
  const secret = refreshCookieValue.slice(idx + 1);

  const refreshDays = getEnv().JWT_REFRESH_EXPIRES_DAYS;

  return prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
    const existing = await tx.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (
      !existing ||
      existing.revokedAt ||
      existing.expiresAt.getTime() < Date.now()
    ) {
      throw new AppError("Not authenticated", 401);
    }

    const ok = await verifyTokenHash(secret, existing.tokenHash);
    if (!ok) {
      throw new AppError("Not authenticated", 401);
    }

    if (existing.user.status === UserStatus.SUSPENDED) {
      throw new AppError("Account suspended", 403);
    }

    const newSecret = generateMagicToken();
    const newHash = await hashToken(newSecret);

    const newSession = await tx.session.create({
      data: {
        userId: existing.userId,
        tokenHash: newHash,
        expiresAt: new Date(
          Date.now() + refreshDays * 24 * 60 * 60 * 1000,
        ),
        ipAddress: clientIp(req),
        userAgent: req.get("user-agent") ?? undefined,
        replacedById: null,
      },
    });

    await tx.session.update({
      where: { id: existing.id },
      data: {
        revokedAt: new Date(),
        replacedById: newSession.id,
      },
    });

    const accessToken = signAccessToken({
      sub: existing.userId,
      sid: newSession.id,
      role: existing.user.role,
    });

    return {
      accessToken,
      refreshToken: `${newSession.id}:${newSecret}`,
    };
  },
    interactiveTransactionOptions,
  );
}

export async function logout(sessionId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getUserForToken(authorization: string | undefined) {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;
  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function loadAuthUser(payload: {
  sub: string;
  sid: string;
  role: UserRole;
}) {
  const session = await prisma.session.findFirst({
    where: {
      id: payload.sid,
      userId: payload.sub,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session || session.user.status === UserStatus.SUSPENDED) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
    sessionId: session.id,
  };
}

export function setRefreshCookie(res: Response, refreshToken: string): void {
  const env = getEnv();
  const isProd = env.NODE_ENV === "production";
  res.cookie(env.COOKIE_REFRESH_NAME, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearRefreshCookie(res: Response): void {
  const env = getEnv();
  const isProd = env.NODE_ENV === "production";
  res.clearCookie(env.COOKIE_REFRESH_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });
}
