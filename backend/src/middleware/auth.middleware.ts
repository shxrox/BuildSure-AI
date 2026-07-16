import {
  clerkMiddleware,
  getAuth,
} from "@clerk/express";

import { Request, Response, NextFunction } from "express";


const authMiddleware = [
  clerkMiddleware({
    publishableKey:
      process.env.CLERK_PUBLISHABLE_KEY,
    secretKey:
      process.env.CLERK_SECRET_KEY,
  }),

  (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {

    req.auth = getAuth(req);

    next();
  },
];


export default authMiddleware;