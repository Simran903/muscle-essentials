import { Router } from "express";
import {
  deleteCartItem,
  getCart,
  patchCartItem,
  postAddCartItem,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();

r.get("/cart", requireAuth, getCart);
r.post("/cart/add", requireAuth, postAddCartItem);
r.patch("/cart/item/:id", requireAuth, patchCartItem);
r.delete("/cart/item/:id", requireAuth, deleteCartItem);

export default r;
