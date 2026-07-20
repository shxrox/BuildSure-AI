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

} from "../controllers/project.controller";



import authMiddleware 
from "../middleware/auth.middleware";



import upload 
from "../middleware/upload.middleware";






const router =
Router();







// Create Project

router.post(

  "/",

  authMiddleware,

  createProject

);








// Get All Projects

router.get(

  "/",

  authMiddleware,

  getProjects

);








// Get Single Project

router.get(

  "/:id",

  authMiddleware,

  getProjectById

);








// Delete Project

router.delete(

  "/:id",

  authMiddleware,

  deleteProject

);










// Upload Blueprint

router.post(

  "/:id/blueprint",

  authMiddleware,

  upload.single(
    "blueprint"
  ),

  uploadBlueprint

);










// Download Blueprint

router.get(

  "/:id/blueprint",

  authMiddleware,

  downloadBlueprint

);







export default router;