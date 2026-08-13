import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model"; // Import your IUser interface

export const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const clerkId = (req as any).auth?.userId; 

    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    // Cast the result to your IUser interface so TypeScript recognizes the custom properties
    const user = await User.findOne({ clerkId }) as IUser | null;

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if user is on a free plan or if their subscription has expired
    const now = new Date();
    const isExpired = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < now;

    if (user.subscription === "FREE" || !user.subscriptionExpiresAt || isExpired) {
      return res.status(403).json({ 
        error: "Subscription required", 
        message: "Please upgrade your plan to access this feature." 
      });
    }

    next();
  } catch (error: any) {
    console.error("Subscription check error:", error);
    res.status(500).json({ error: "Internal server error during subscription check." });
  }
};