import { Router } from "express";
import { getShopFilters } from "../controllers/filters.controller.js";

const r = Router();

r.get("/filters", getShopFilters);

export default r;
