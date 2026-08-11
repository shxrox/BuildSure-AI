// import {
//   Router,
// } from "express";

// import {
//   createProject,
//   getProjects,
//   getProjectById,
//   deleteProject,
//   uploadBlueprint,
//   downloadBlueprint,
//   deleteBlueprint, 
//   getDigitalPlan,
//   updateDigitalPlan,
//   processBlueprint
// } from "../controllers/project.controller";

// import authMiddleware from "../middleware/auth.middleware";

// import upload from "../middleware/upload.middleware";

// const router = Router();

// // CREATE PROJECT
// router.post(
//   "/",
//   authMiddleware,
//   createProject
// );

// // GET ALL PROJECTS
// router.get(
//   "/",
//   authMiddleware,
//   getProjects
// );

// // GET PROJECT BY ID
// router.get(
//   "/:id",
//   authMiddleware,
//   getProjectById
// );

// // DELETE PROJECT
// router.delete(
//   "/:id",
//   authMiddleware,
//   deleteProject
// );

// // UPLOAD BLUEPRINT
// router.post(
//   "/:id/blueprint",
//   authMiddleware,
//   upload.single("blueprint"),
//   uploadBlueprint
// );

// // DOWNLOAD / VIEW BLUEPRINT
// router.get(
//   "/:id/blueprint",
//   authMiddleware,
//   downloadBlueprint
// );

// // DELETE BLUEPRINT <-- 2. Add this route handler
// router.delete(
//   "/:id/blueprint",
//   authMiddleware,
//   deleteBlueprint
// );

// router.get(
//   "/:id/digital-plan",
//   authMiddleware,
//   getDigitalPlan
// );

// router.put(
//   "/:id/digital-plan",
//   authMiddleware,
//   updateDigitalPlan
// );

// router.post(
//   "/:id/process-blueprint",
//   authMiddleware,
//   processBlueprint
// );

// export default router;

import {
  Router,
} from "express";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject, // 1. Ensure updateProject is imported
  deleteProject,
  uploadBlueprint,
  downloadBlueprint,
  deleteBlueprint, 
  getDigitalPlan,
  updateDigitalPlan,
  processBlueprint
} from "../controllers/project.controller";

import authMiddleware from "../middleware/auth.middleware";

import upload from "../middleware/upload.middleware";

const router = Router();

// CREATE PROJECT
router.post(
  "/",
  authMiddleware,
  createProject
);

// GET ALL PROJECTS
router.get(
  "/",
  authMiddleware,
  getProjects
);

// GET PROJECT BY ID
router.get(
  "/:id",
  authMiddleware,
  getProjectById
);

// UPDATE PROJECT (CRITICAL: This handles milestones and project edits)
router.put(
  "/:id",
  authMiddleware,
  updateProject
);

// DELETE PROJECT
router.delete(
  "/:id",
  authMiddleware,
  deleteProject
);

// UPLOAD BLUEPRINT
router.post(
  "/:id/blueprint",
  authMiddleware,
  upload.single("blueprint"),
  uploadBlueprint
);

// DOWNLOAD / VIEW BLUEPRINT
router.get(
  "/:id/blueprint",
  authMiddleware,
  downloadBlueprint
);

// DELETE BLUEPRINT
router.delete(
  "/:id/blueprint",
  authMiddleware,
  deleteBlueprint
);

router.get(
  "/:id/digital-plan",
  authMiddleware,
  getDigitalPlan
);

router.put(
  "/:id/digital-plan",
  authMiddleware,
  updateDigitalPlan
);

router.post(
  "/:id/process-blueprint",
  authMiddleware,
  processBlueprint
);

export default router;