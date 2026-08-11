import {
  Request,
  Response,
} from "express";

import Project from "../models/project.model";
import User from "../models/user.model";

import {
  successResponse,
} from "../utils/apiResponse";

import {
  XMLParser
} from "fast-xml-parser";

// CREATE PROJECT

export const createProject =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        projectName,
        location,
        description,
      } = req.body;

      const clerkId =
        req.auth?.userId;

      if (!clerkId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const user =
        await User.findOne({
          clerkId
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const project =
        await Project.create({
          ownerId: user._id,
          projectName,
          location,
          description
        });

      return successResponse(
        res,
        "Project created successfully",
        project
      );
    }
    catch (error) {
      console.error(
        "CREATE PROJECT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create project"
      });
    }
  };

// GET PROJECTS

export const getProjects =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const clerkId =
        req.auth?.userId;

      if (!clerkId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const user =
        await User.findOne({
          clerkId
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const projects =
        await Project.find({
          ownerId: user._id
        });

      return successResponse(
        res,
        "Projects fetched successfully",
        projects
      );
    }
    catch (error) {
      console.error(
        "GET PROJECTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch projects"
      });
    }
  };

// GET PROJECT BY ID

export const getProjectById =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const clerkId =
        req.auth?.userId;

      if (!clerkId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const user =
        await User.findOne({
          clerkId
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const project =
        await Project.findOne({
          _id: req.params.id,
          ownerId: user._id
        });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      return successResponse(
        res,
        "Project fetched successfully",
        project
      );
    }
    catch (error) {
      console.error(
        "GET PROJECT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch project"
      });
    }
  };

// DELETE PROJECT

export const deleteProject =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const clerkId =
        req.auth?.userId;

      if (!clerkId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const user =
        await User.findOne({
          clerkId
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const project =
        await Project.findOneAndDelete({
          _id: req.params.id,
          ownerId: user._id
        });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      return res.json({
        success: true,
        message:
          "Project deleted successfully"
      });
    }
    catch (error) {
      console.error(
        "DELETE PROJECT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete project"
      });
    }
  };

// UPLOAD BLUEPRINT

export const uploadBlueprint =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const clerkId =
        req.auth?.userId;

      if (!clerkId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const user =
        await User.findOne({
          clerkId
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const project =
        await Project.findOne({
          _id: req.params.id,
          ownerId: user._id
        });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Blueprint file required"
        });
      }

      project.blueprint = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileData: req.file.buffer,
        uploadedAt: new Date()
      };

      await project.save();

      return successResponse(
        res,
        "Blueprint uploaded successfully",
        {
          fileName:
            project.blueprint.fileName,
          fileType:
            project.blueprint.fileType,
          uploadedAt:
            project.blueprint.uploadedAt,
          svgData:
            project.blueprint.fileData.toString(
              "utf-8"
            )
        }
      );
    }
    catch (error) {
      console.error(
        "UPLOAD BLUEPRINT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload blueprint"
      });
    }
  };

// DOWNLOAD BLUEPRINT

export const downloadBlueprint =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const project =
        await Project.findById(
          req.params.id
        );

      if (
        !project ||
        !project.blueprint
      ) {
        return res.status(404).json({
          success: false,
          message: "Blueprint not found"
        });
      }

      res.setHeader(
        "Content-Type",
        project.blueprint.fileType
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename="${project.blueprint.fileName}"`
      );

      return res.send(
        project.blueprint.fileData
      );
    }
    catch (error) {
      console.error(
        "DOWNLOAD BLUEPRINT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to download blueprint"
      });
    }
  };

// DELETE BLUEPRINT (ADDED)

export const deleteBlueprint =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const clerkId = req.auth?.userId;

      if (!clerkId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }

      const user = await User.findOne({ clerkId });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const project = await Project.findOne({
        _id: req.params.id,
        ownerId: user._id
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      project.blueprint = undefined as any;
      await project.save();

      return successResponse(
        res,
        "Blueprint deleted successfully",
        project
      );
    }
    catch (error) {
      console.error(
        "DELETE BLUEPRINT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete blueprint"
      });
    }
  };

// GET DIGITAL PLAN

export const getDigitalPlan =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const project =
        await Project.findById(
          req.params.id
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      return successResponse(
        res,
        "Digital plan fetched successfully",
        project.digitalPlan || {
          walls: [],
          rooms: [],
          doors: [],
          windows: [],
          furniture: []
        }
      );
    }
    catch (error) {
      console.error(
        "GET DIGITAL PLAN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch digital plan"
      });
    }
  };

// UPDATE DIGITAL PLAN

// export const updateDigitalPlan =
//   async (
//     req: Request,
//     res: Response
//   ) => {
//     try {
//       const project =
//         await Project.findById(
//           req.params.id
//         );

//       if (!project) {
//         return res.status(404).json({
//           success: false,
//           message: "Project not found"
//         });
//       }

//       project.digitalPlan = {
//         walls:
//           req.body.walls || [],
//         rooms:
//           req.body.rooms || [],
//         doors:
//           req.body.doors || [],
//         windows:
//           req.body.windows || [],
//         furniture:
//           req.body.furniture || [],
//       };

//       await project.save();

//       return successResponse(
//         res,
//         "Digital plan updated successfully",
//         project.digitalPlan
//       );
//     }
//     catch (error) {
//       console.error(
//         "UPDATE DIGITAL PLAN ERROR:",
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         message:
//           error instanceof Error
//             ? error.message
//             : "Failed to update digital plan"
//       });
//     }
//   };
// UPDATE DIGITAL PLAN
export const updateDigitalPlan = async (
  req: Request,
  res: Response
) => {
  try {
    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Preserve existing costSettings if not provided in the request body, 
    // or update them if they are included.
    const existingCostSettings = project.digitalPlan?.costSettings || {
      actualSpent: 0,
      rates: {
        cementRate: 2800,
        brickRate: 35,
        sandRate: 25000,
        tileRate: 4500,
        laborRatePerSqm: 18000,
      }
    };

    project.digitalPlan = {
      walls: req.body.walls || project.digitalPlan?.walls || [],
      rooms: req.body.rooms || project.digitalPlan?.rooms || [],
      doors: req.body.doors || project.digitalPlan?.doors || [],
      windows: req.body.windows || project.digitalPlan?.windows || [],
      furniture: req.body.furniture || project.digitalPlan?.furniture || [],
      costSettings: req.body.costSettings || existingCostSettings,
    };

    await project.save();

    return successResponse(
      res,
      "Digital plan updated successfully",
      project.digitalPlan
    );
  }
  catch (error) {
    console.error(
      "UPDATE DIGITAL PLAN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update digital plan"
    });
  }
};
// PROCESS SVG BLUEPRINT INTO DIGITAL PLAN

export const processBlueprint =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const project =
        await Project.findById(
          req.params.id
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      if (
        !project.blueprint ||
        !project.blueprint.fileData
      ) {
        return res.status(400).json({
          success: false,
          message: "Blueprint not uploaded"
        });
      }

      const svgContent =
        project.blueprint.fileData.toString(
          "utf-8"
        );

      const parser =
        new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_"
        });

      const svg =
        parser.parse(
          svgContent
        );

      const walls: any[] = [];
      const rooms: any[] = [];
      const doors: any[] = [];
      const windows: any[] = [];
      const furniture: any[] = [];

      const elements =
        svg.svg;

      if (elements && elements.line) {
        const lines =
          Array.isArray(elements.line)
            ? elements.line
            : [elements.line];

        lines.forEach(
          (line: any) => {
            walls.push({
              id: Date.now().toString() + Math.random(),
              startX: Number(line["@_x1"] || 0),
              startY: Number(line["@_y1"] || 0),
              endX: Number(line["@_x2"] || 0),
              endY: Number(line["@_y2"] || 0),
              thickness: 200,
              height: 3.0
            });
          });
      }

      if (elements && elements.rect) {
        const rects =
          Array.isArray(elements.rect)
            ? elements.rect
            : [elements.rect];

        rects.forEach(
          (rect: any) => {
            const rx = Number(rect["@_x"] || 0);
            const ry = Number(rect["@_y"] || 0);
            const rw = Number(rect["@_width"] || 0);
            const rh = Number(rect["@_height"] || 0);

            rooms.push({
              id: Date.now().toString() + Math.random(),
              name: "Room",
              points: [
                { x: rx, y: ry },
                { x: rx + rw, y: ry },
                { x: rx + rw, y: ry + rh },
                { x: rx, y: ry + rh }
              ],
              areaSqm: (rw * rh) / 10000,
              color: "rgba(99,102,241,0.12)"
            });
          });
      }

      project.digitalPlan = {
        walls,
        rooms,
        doors,
        windows,
        furniture
      };

      await project.save();

      return successResponse(
        res,
        "Blueprint processed successfully",
        project.digitalPlan
      );
    }
    catch (error) {
      console.error(
        "PROCESS BLUEPRINT ERROR",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process blueprint"
      });
    }
  };