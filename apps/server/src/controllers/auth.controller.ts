import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "database";
import { getEnv } from "../config/env.js";
import { sendSuccess } from "../utils/response.js";
import {
  clearRefreshCookie,
  getUserForToken,
  logout,
  refreshSession,
  setRefreshCookie,
  verifyMagicDidAuth,
} from "../services/auth.service.js";

const verifyDidBody = z.object({
  didToken: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().trim().min(6).max(32),
});

export async function postVerifyDid(req: Request, res: Response): Promise<void> {
  const body = verifyDidBody.parse(req.body);
  const result = await verifyMagicDidAuth(
    req,
    body.didToken,
    body.email,
    body.phone,
  );
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(
    res,
    {
      accessToken: result.accessToken,
      user: result.user,
    },
    "Signed in successfully",
  );
}

export async function postRefresh(req: Request, res: Response): Promise<void> {
  const env = getEnv();
  const raw = req.cookies[env.COOKIE_REFRESH_NAME] as string | undefined;
  const rotated = await refreshSession(req, raw);
  setRefreshCookie(res, rotated.refreshToken);
  sendSuccess(res, { accessToken: rotated.accessToken }, "Session refreshed");
}

export async function postLogout(req: Request, res: Response): Promise<void> {
  const payload = await getUserForToken(req.headers.authorization);
  if (payload) {
    await logout(payload.sid);
  }
  clearRefreshCookie(res);
  sendSuccess(res, {}, "Signed out");
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Not authenticated",
      error: "Not authenticated",
    });
    return;
  }
  const full = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
  sendSuccess(res, { user: full }, "");
}
