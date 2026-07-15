import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware";

const router = Router();


router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "BuildSure-AI API is running",
  });
});


router.get(
  "/protected",
  authMiddleware,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "You accessed a protected route",
      user: req.auth,
    });
  }
);


export default router;