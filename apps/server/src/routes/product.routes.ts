import { Router } from "express";
import {
  getBrandProducts,
  getCategoryProducts,
  getProduct,
  getProducts,
  getSearch,
} from "../controllers/product.controller.js";
import {
  getProductReviews,
  postProductReview,
} from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const r = Router();

r.get("/products", getProducts);
r.get("/products/:slug/reviews", getProductReviews);
r.post("/products/:slug/reviews", requireAuth, postProductReview);
r.get("/products/:slug", getProduct);
r.get("/category/:slug", getCategoryProducts);
r.get("/brand/:slug", getBrandProducts);
r.get("/search", getSearch);

export default r;
