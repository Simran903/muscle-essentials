import { Router } from "express";
import {
  getMe,
  postLogout,
  postRefresh,
  postVerifyDid,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { authVerifyLimiter } from "../middleware/rateLimit.middleware.js";

const r = Router();

r.post("/verify-did", authVerifyLimiter, postVerifyDid);
r.post("/refresh", postRefresh);
r.post("/logout", postLogout);
r.get("/me", requireAuth, getMe);

export default r;
