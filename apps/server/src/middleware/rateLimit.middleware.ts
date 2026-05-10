import rateLimit from "express-rate-limit";

import { getEnv } from "../config/env.js";

/** Generous in development (admin UI + hot reload); tighter in production. */
function apiMaxRequests(): number {
  try {
    return getEnv().NODE_ENV === "development" ? 2_000 : 600;
  } catch {
    return 600;
  }
}

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: apiMaxRequests(),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests",
    error: "Too many requests",
  },
});

export const authMagicLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many magic link requests",
    error: "Too many magic link requests",
  },
});

export const authVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts",
    error: "Too many verification attempts",
  },
});
