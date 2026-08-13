

import { Router } from "express";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  updateCollaborators,
  deleteProject,
  uploadBlueprint,
  downloadBlueprint,
  deleteBlueprint, 
  getDigitalPlan,
  updateDigitalPlan,
  processBlueprint
} from "../controllers/project.controller";

import { requirePro } from "../middleware/requirePro";
import authMiddleware from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";

const router = Router();

// CREATE PROJECT
router.post("/", authMiddleware, createProject);

// GET ALL PROJECTS
router.get("/", authMiddleware, getProjects);

// GET PROJECT BY ID
router.get("/:id", getProjectById);

// UPDATE PROJECT
router.put("/:id", authMiddleware, updateProject);

// DELETE PROJECT
router.delete("/:id", authMiddleware, deleteProject);

// UPLOAD BLUEPRINT
router.post("/:id/blueprint", authMiddleware, upload.single("blueprint"), uploadBlueprint);

// DOWNLOAD / VIEW BLUEPRINT
router.get("/:id/blueprint", authMiddleware, downloadBlueprint);

// DELETE BLUEPRINT
router.delete("/:id/blueprint", authMiddleware, deleteBlueprint);

router.patch("/:id/collaborators", authMiddleware, updateCollaborators);

router.get("/:id/digital-plan", authMiddleware, getDigitalPlan);

router.put("/:id/digital-plan", authMiddleware, updateDigitalPlan);

// PROCESS BLUEPRINT (AI 3D RENDER) - PROTECTED BY PRO SUBSCRIPTION
router.post(
  "/:id/process-blueprint",
  authMiddleware,
  requirePro, 
  processBlueprint
);

// If you have an ai-render route, make sure the controller exists or route it to processBlueprint
router.get(
  "/:id/ai-render",
  authMiddleware,
  requirePro,
  processBlueprint 
);



export default router;