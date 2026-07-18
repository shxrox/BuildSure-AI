// import { Request, Response } from "express";

// import createOrGetUser from "../services/user.service";
// import { successResponse } from "../utils/apiResponse";


// export const getCurrentUser = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const clerkId = req.auth.userId;


//     if (!clerkId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }


//     const user =
//       await createOrGetUser({
//         clerkId,
//       });


//     return successResponse(
//       res,
//       "User profile fetched successfully",
//       user
//     );

//     } catch (error) {

//     console.error("GET CURRENT USER ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message:
//         error instanceof Error
//           ? error.message
//           : "Failed to fetch user",
//     });

//   }
// };

import { Request, Response } from "express";

import { createClerkClient } from "@clerk/backend";

import createOrGetUser from "../services/user.service";
import { successResponse } from "../utils/apiResponse";
import User from "../models/user.model";
import Project from "../models/project.model";


const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});


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

    const user = await createOrGetUser({
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


export const deleteCurrentUser = async (
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

    const user = await User.findOne({
      clerkId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Project.deleteMany({
      ownerId: user._id,
    });

    await User.findByIdAndDelete(user._id);

    await clerkClient.users.deleteUser(clerkId);

    return successResponse(
      res,
      "Account deleted successfully"
    );
  } catch (error) {
    console.error("DELETE CURRENT USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete account",
    });
  }
};