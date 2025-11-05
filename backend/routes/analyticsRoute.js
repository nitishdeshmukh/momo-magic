// backend/routes/analyticsRoute.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import { isAdminOrDeveloper } from "../middleware/role.js";
import {
  newCustomers,
  repeatRate,
  dishRank,
  revenueByWeek,
  popularCombos,
  revenueTotal,
  dishNameMap,
  contactsByRange, // NEW
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/new-customers", authMiddleware, isAdminOrDeveloper, newCustomers);
router.get("/repeat-rate", authMiddleware, isAdminOrDeveloper, repeatRate);
router.get("/top-dishes", authMiddleware, isAdminOrDeveloper, (req, res, next) => { req.query.order = "desc"; next(); }, dishRank);
router.get("/least-dishes", authMiddleware, isAdminOrDeveloper, (req, res, next) => { req.query.order = "asc"; next(); }, dishRank);
router.get("/revenue-month", authMiddleware, isAdminOrDeveloper, revenueByWeek);
router.get("/popular-combos", authMiddleware, isAdminOrDeveloper, popularCombos);
router.get("/revenue-total", authMiddleware, isAdminOrDeveloper, revenueTotal);
router.get("/dish-name-map", authMiddleware, isAdminOrDeveloper, dishNameMap);

// NEW: export unique contacts for a date range (based on orders)
router.get("/contacts", authMiddleware, isAdminOrDeveloper, contactsByRange);

export default router;
