import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import requireRole from "../middleware/role.middleware";
import { UserRole } from "../enums/user-role.enum";

import {
  getPlatformAnalytics,
  getFinancialMetrics,
  getTransactionsList,
  getUsersDirectory,
  updateUserRoleOrSubscription,
  getAllProjectsOverview,
  getGlobalRates,
  updateGlobalRates
} from "../controllers/admin.controller";

const router = Router();

// Protect all admin routes automatically
router.use(authMiddleware, requireRole([UserRole.ADMIN]));

router.get("/analytics/growth", getPlatformAnalytics);
router.get("/analytics/financials", getFinancialMetrics);
router.get("/transactions", getTransactionsList);
router.patch("/users/:userId/subscription", updateUserRoleOrSubscription);
router.get("/users", getUsersDirectory);
router.get("/projects", getAllProjectsOverview);
router.get("/rates", getGlobalRates);
router.put("/rates", updateGlobalRates);

export default router;