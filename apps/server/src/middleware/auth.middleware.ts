import type { NextFunction, Request, Response } from "express";
import { getUserForToken, loadAuthUser } from "../services/auth.service.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const payload = await getUserForToken(req.headers.authorization);
  if (!payload) {
    res.status(401).json({
      success: false,
      message: "Not authenticated",
      error: "Not authenticated",
    });
    return;
  }
  const user = await loadAuthUser(payload);
  if (!user) {
    res.status(401).json({
      success: false,
      message: "Not authenticated",
      error: "Not authenticated",
    });
    return;
  }
  req.user = user;
  next();
}
