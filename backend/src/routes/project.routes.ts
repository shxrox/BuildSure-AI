import {
  Router,
} from "express";



import {

  createProject,

  getProjects,

  getProjectById,

  deleteProject,

} from "../controllers/project.controller";


import authMiddleware from "../middleware/auth.middleware";



const router =
  Router();



router.post(
  "/",
  authMiddleware,
  createProject
);

router.get(
  "/:id",
  authMiddleware,
  getProjectById
);

router.get(
  "/",
  authMiddleware,
  getProjects
);



router.get(
  "/:id",
  authMiddleware,
  getProjectById
);



router.delete(
  "/:id",
  authMiddleware,
  deleteProject
);



export default router;