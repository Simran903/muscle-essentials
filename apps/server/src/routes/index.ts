import { Router } from "express";
import accountRoutes from "./account.routes.js";
import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import cartRoutes from "./cart.routes.js";
import checkoutRoutes from "./checkout.routes.js";
import filterRoutes from "./filters.routes.js";
import orderRoutes from "./order.routes.js";
import productRoutes from "./product.routes.js";

const api = Router();

api.use("/auth", authRoutes);
api.use(filterRoutes);
api.use(productRoutes);
api.use(cartRoutes);
api.use(checkoutRoutes);
api.use(orderRoutes);
api.use(accountRoutes);
api.use(adminRoutes);

export default api;
