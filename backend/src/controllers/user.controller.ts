import { Request, Response } from "express";

import createOrGetUser from "../services/user.service";
import { successResponse } from "../utils/apiResponse";


export const getCurrentUser = async (
  req: Request,
  res: Response
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
      await createOrGetUser({
        clerkId,
      });


    return successResponse(
      res,
      "User profile fetched successfully",
      user
    );

    } catch (error) {

    console.error("GET CURRENT USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch user",
    });

  }
};