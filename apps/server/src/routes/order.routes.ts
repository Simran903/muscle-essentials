import { Router } from "express";
import {
  getOrderById,
  getOrders,
  postOrder,
} from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();

r.post("/order", requireAuth, postOrder);
r.get("/orders", requireAuth, getOrders);
r.get("/orders/:id", requireAuth, getOrderById);

export default r;
