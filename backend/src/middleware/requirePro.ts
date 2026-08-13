import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import User from "../models/user.model";

export const requirePro = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth?.userId;

    if (!clerkUserId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const user = await User.findOne({ clerkId: clerkUserId });

    if (!user) {
      return res.status(404).json({ error: "User not found in database." });
    }

    const isPro = user.subscription === "PRO";
    const hasNotExpired = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();

    if (!isPro || !hasNotExpired) {
      return res.status(403).json({ 
        error: "Access denied. Active PRO subscription required to use this feature." 
      });
    }

    next();
  } catch (error: any) {
    console.error("Subscription check error:", error);
    return res.status(500).json({ error: "Internal server error during subscription validation." });
  }
};