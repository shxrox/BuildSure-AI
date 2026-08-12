// import { Request, Response, NextFunction } from "express";
// import User from "../models/user.model";

// export const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//   try {
//     // Assuming Clerk or your auth middleware attaches clerkId or userId to req.auth / req.user
//     const clerkId = (req as any).auth?.userId; 

//     if (!clerkId) {
//       return res.status(401).json({ error: "Unauthorized access." });
//     }

//     const user = await User.findOne({ clerkId });

//     if (!user) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     // Check if user is on a free plan or if their subscription has expired
//     const now = new Date();
//     const isExpired = user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < now;

//     if (user.subscription === "FREE" || !user.subscriptionExpiresAt || isExpired) {
//       return res.status(403).json({ 
//         error: "Subscription required", 
//         message: "Please upgrade your plan to access this feature." 
//       });
//     }

//     // Subscription is active, proceed
//     next();
//   } catch (error: any) {
//     console.error("Subscription check error:", error);
//     res.status(500).json({ error: "Internal server error during subscription check." });
//   }
// };