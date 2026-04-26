import { Router } from "express";
import {
  deleteAccountAddress,
  getAccount,
  getAccountAddresses,
  getAccountOrders,
  patchAccountAddress,
  postAccountAddress,
} from "../controllers/account.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();

r.get("/account", requireAuth, getAccount);
r.get("/account/orders", requireAuth, getAccountOrders);
r.get("/account/addresses", requireAuth, getAccountAddresses);
r.post("/account/addresses", requireAuth, postAccountAddress);
r.patch("/account/addresses/:id", requireAuth, patchAccountAddress);
r.delete("/account/addresses/:id", requireAuth, deleteAccountAddress);

export default r;
