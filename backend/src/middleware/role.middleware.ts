import { Request, Response, NextFunction } from "express";

import User from "../models/user.model";

import { UserRole } from "../enums/user-role.enum";


const requireRole = (
  allowedRoles: UserRole[]
) => {

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const clerkId = req.auth.userId;


      if (!clerkId) {

        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });

      }


      const user =
        await User.findOne({
          clerkId,
        });


      if (!user) {

        return res.status(404).json({
          success: false,
          message: "User profile not found",
        });

      }


      if (
        !allowedRoles.includes(
          user.role
        )
      ) {

        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to access this resource",
        });

      }


      req.user = user;


      next();


    } catch (error) {

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Role verification failed",
      });

    }

  };

};


export default requireRole;