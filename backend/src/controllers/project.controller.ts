import {
  Request,
  Response,
} from "express";


import Project from "../models/project.model";

import User from "../models/user.model";


import {
  successResponse,
} from "../utils/apiResponse";





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

        success:false,

        message:"Unauthorized",

      });

    }




    const user =
      await User.findOne({

        clerkId,

      });




    if (!user) {

      return res.status(404).json({

        success:false,

        message:"User not found",

      });

    }





    const project =
      await Project.create({

        ownerId:user._id,

        projectName,

        location,

        description,

      });





    return successResponse(

      res,

      "Project created successfully",

      project

    );



  } catch(error) {


    console.error(
      "CREATE PROJECT ERROR:",
      error
    );



    return res.status(500).json({

      success:false,

      message:
        error instanceof Error
          ? error.message
          : "Failed to create project",

    });

  }

};









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

        success:false,

        message:"Unauthorized",

      });

    }




    const user =
      await User.findOne({

        clerkId,

      });




    if (!user) {

      return res.status(404).json({

        success:false,

        message:"User not found",

      });

    }




    const projects =
      await Project.find({

        ownerId:user._id,

      });





    return successResponse(

      res,

      "Projects fetched successfully",

      projects

    );



  } catch(error) {


    console.error(
      "GET PROJECTS ERROR:",
      error
    );



    return res.status(500).json({

      success:false,

      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch projects",

    });

  }

};









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

        success:false,

        message:"Unauthorized",

      });

    }




    const user =
      await User.findOne({

        clerkId,

      });




    if (!user) {

      return res.status(404).json({

        success:false,

        message:"User not found",

      });

    }




    const project =
      await Project.findOne({

        _id:req.params.id,

        ownerId:user._id,

      });





    if (!project) {

      return res.status(404).json({

        success:false,

        message:"Project not found",

      });

    }





    return successResponse(

      res,

      "Project fetched successfully",

      project

    );



  } catch(error) {


    console.error(
      "GET PROJECT BY ID ERROR:",
      error
    );



    return res.status(500).json({

      success:false,

      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch project",

    });

  }

};









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

        success:false,

        message:"Unauthorized",

      });

    }




    const user =
      await User.findOne({

        clerkId,

      });




    if (!user) {

      return res.status(404).json({

        success:false,

        message:"User not found",

      });

    }





    const project =
      await Project.findOneAndDelete({

        _id:req.params.id,

        ownerId:user._id,

      });





    if (!project) {

      return res.status(404).json({

        success:false,

        message:"Project not found",

      });

    }





    return res.json({

      success:true,

      message:
        "Project deleted successfully",

    });



  } catch(error) {


    console.error(
      "DELETE PROJECT ERROR:",
      error
    );



    return res.status(500).json({

      success:false,

      message:
        error instanceof Error
          ? error.message
          : "Failed to delete project",

    });

  }

};









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

        success:false,

        message:"Unauthorized",

      });

    }




    const user =
      await User.findOne({

        clerkId,

      });




    if (!user) {

      return res.status(404).json({

        success:false,

        message:"User not found",

      });

    }




    const project =
      await Project.findOne({

        _id:req.params.id,

        ownerId:user._id,

      });





    if (!project) {

      return res.status(404).json({

        success:false,

        message:"Project not found",

      });

    }





    project.blueprint = {

      fileName:
        "sample-blueprint",

      fileType:
        "image/png",

      fileUrl:
        "",

      uploadedAt:
        new Date(),

    };





    await project.save();





    return successResponse(

      res,

      "Blueprint uploaded successfully",

      project.blueprint

    );



  } catch(error) {


    console.error(
      "UPLOAD BLUEPRINT ERROR:",
      error
    );



    return res.status(500).json({

      success:false,

      message:
        error instanceof Error
          ? error.message
          : "Failed to upload blueprint",

    });

  }

};