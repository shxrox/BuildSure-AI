// import { Router, Request, Response } from "express";

// import authMiddleware from "../middleware/auth.middleware";

// import requireRole from "../middleware/role.middleware";

// import {
//   getCurrentUser,
// } from "../controllers/user.controller";

// import { UserRole } from "../enums/user-role.enum";


// const router = Router();


// router.get(
//   "/me",
//   authMiddleware,
//   getCurrentUser
// );



// router.get(
//   "/homeowner-test",
//   authMiddleware,
//   requireRole([
//     UserRole.HOMEOWNER,
//   ]),
//   (_req: Request, res: Response) => {

//     res.json({
//       success: true,
//       message:
//         "Welcome Homeowner",
//     });

//   }
// );



// router.get(
//   "/admin-test",
//   authMiddleware,
//   requireRole([
//     UserRole.ADMIN,
//   ]),
//   (_req: Request, res: Response) => {

//     res.json({
//       success: true,
//       message:
//         "Welcome Admin",
//     });

//   }
// );



// export default router;

import { Router, Request, Response } from "express";

import authMiddleware from "../middleware/auth.middleware";
import requireRole from "../middleware/role.middleware";

import {
  getCurrentUser,
  deleteCurrentUser,
} from "../controllers/user.controller";

import { UserRole } from "../enums/user-role.enum";


const router = Router();


router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);


router.delete(
  "/me",
  authMiddleware,
  deleteCurrentUser
);


router.get(
  "/homeowner-test",
  authMiddleware,
  requireRole([
    UserRole.HOMEOWNER,
  ]),
  (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Welcome Homeowner",
    });
  }
);


router.get(
  "/admin-test",
  authMiddleware,
  requireRole([
    UserRole.ADMIN,
  ]),
  (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Welcome Admin",
    });
  }
);


export default router;