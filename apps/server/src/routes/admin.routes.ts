import { Router } from "express";
import {
  adminGetBrands,
  adminGetCategories,
  adminGetOrderById,
  adminGetOrders,
  adminGetProducts,
  adminGetReviews,
  adminGetUsers,
  adminPatchBrand,
  adminPatchCategory,
  adminPatchOrder,
  adminPatchProduct,
  adminPatchReview,
  adminPatchUser,
  adminPostBrand,
  adminPostCategory,
  adminPostProduct,
  adminRemoveBrand,
  adminRemoveCategory,
  adminRemoveProduct,
} from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();

const admin = [requireAuth, requireAdmin] as const;

r.get("/admin/brands", ...admin, adminGetBrands);
r.post("/admin/brands", ...admin, adminPostBrand);
r.patch("/admin/brands/:id", ...admin, adminPatchBrand);
r.delete("/admin/brands/:id", ...admin, adminRemoveBrand);

r.get("/admin/categories", ...admin, adminGetCategories);
r.post("/admin/categories", ...admin, adminPostCategory);
r.patch("/admin/categories/:id", ...admin, adminPatchCategory);
r.delete("/admin/categories/:id", ...admin, adminRemoveCategory);

r.get("/admin/products", ...admin, adminGetProducts);
r.post("/admin/products", ...admin, adminPostProduct);
r.patch("/admin/products/:id", ...admin, adminPatchProduct);
r.delete("/admin/products/:id", ...admin, adminRemoveProduct);

r.get("/admin/orders", ...admin, adminGetOrders);
r.get("/admin/orders/:id", ...admin, adminGetOrderById);
r.patch("/admin/orders/:id", ...admin, adminPatchOrder);

r.get("/admin/users", ...admin, adminGetUsers);
r.patch("/admin/users/:id", ...admin, adminPatchUser);

r.get("/admin/reviews", ...admin, adminGetReviews);
r.patch("/admin/reviews/:id", ...admin, adminPatchReview);

export default r;
