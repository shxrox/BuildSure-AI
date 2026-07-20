import {
  Router,
} from "express";


import {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
  uploadBlueprint,
  downloadBlueprint,
  getDigitalPlan,
  updateDigitalPlan
} from "../controllers/project.controller";


import authMiddleware from "../middleware/auth.middleware";


import upload from "../middleware/upload.middleware";





const router =
Router();





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

  upload.single(
    "blueprint"
  ),

  uploadBlueprint

);







// DOWNLOAD / VIEW BLUEPRINT
router.get(

  "/:id/blueprint",

  authMiddleware,

  downloadBlueprint

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






export default router;