import { Router } from "express";
import { postCheckout } from "../controllers/checkout.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();

r.post("/checkout", requireAuth, postCheckout);

export default r;
