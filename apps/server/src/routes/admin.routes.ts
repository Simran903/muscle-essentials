import { Router } from "express";
import {
  adminGetBrands,
  adminGetCategories,
  adminGetOrderById,
  adminGetOrders,
  adminGetProductImages,
  adminGetProducts,
  adminGetReviews,
  adminGetUsers,
  adminPatchBrand,
  adminPatchCategory,
  adminPatchOrder,
  adminPatchProduct,
  adminPutProductVariantSpotlights,
  adminPatchProductImage,
  adminPatchReview,
  adminPatchUser,
  adminPostBrand,
  adminPostCategory,
  adminPostProduct,
  adminPostProductImages,
  adminRemoveBrand,
  adminRemoveCategory,
  adminRemoveProduct,
  adminRemoveProductImage,
  adminSignUpload,
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
r.put("/admin/products/:id/variant-spotlights", ...admin, adminPutProductVariantSpotlights);
r.delete("/admin/products/:id", ...admin, adminRemoveProduct);

r.post("/admin/uploads/sign", ...admin, adminSignUpload);
r.get("/admin/products/:id/images", ...admin, adminGetProductImages);
r.post("/admin/products/:id/images", ...admin, adminPostProductImages);
r.patch("/admin/products/:id/images/:imageId", ...admin, adminPatchProductImage);
r.delete("/admin/products/:id/images/:imageId", ...admin, adminRemoveProductImage);

r.get("/admin/orders", ...admin, adminGetOrders);
r.get("/admin/orders/:id", ...admin, adminGetOrderById);
r.patch("/admin/orders/:id", ...admin, adminPatchOrder);

r.get("/admin/users", ...admin, adminGetUsers);
r.patch("/admin/users/:id", ...admin, adminPatchUser);

r.get("/admin/reviews", ...admin, adminGetReviews);
r.patch("/admin/reviews/:id", ...admin, adminPatchReview);

export default r;
