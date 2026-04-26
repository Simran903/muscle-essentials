import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { getEnv, getCorsOrigins } from "./config/env.js";
import api from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";

export function createApp(): express.Express {
  const env = getEnv();
  const app = express();

  if (env.TRUST_PROXY) {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: getCorsOrigins(),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { ok: true }, message: "" });
  });

  app.use(apiRateLimiter);
  app.use("/api", api);
  app.use(errorMiddleware);

  return app;
}
