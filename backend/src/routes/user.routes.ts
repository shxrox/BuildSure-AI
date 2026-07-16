import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware";

import {
  getCurrentUser,
} from "../controllers/user.controller";


const router = Router();


router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);


export default router;