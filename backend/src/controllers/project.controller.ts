import {
  Request,
  Response,
} from "express";


import Project from "../models/project.model";

import User from "../models/user.model";





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



    console.log(
      "CREATE PROJECT BODY:",
      req.body
    );



    const userId =
      req.auth?.userId;



    console.log(
      "CLERK USER ID:",
      userId
    );



    if (!userId) {

      return res.status(401).json({

        success:false,

        message:"Unauthorized",

      });

    }



    const user =
      await User.findOne({

        clerkId:userId,

      });



    console.log(
      "DATABASE USER:",
      user
    );



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



    console.log(
      "CREATED PROJECT:",
      project
    );



    return res.status(201).json({

      success:true,

      message:
        "Project created successfully",

      data:project,

    });



  } catch(error:any) {


    console.log(
      "CREATE PROJECT ERROR:",
      error.message
    );


    return res.status(500).json({

      success:false,

      message:
        "Failed to create project",

      error:
        error.message,

    });


  }

};










export const getProjects =
async (
  req: Request,
  res: Response
) => {

  try {


    const userId =
      req.auth?.userId;



    console.log(
      "GET PROJECT USER:",
      userId
    );



    if (!userId) {

      return res.status(401).json({

        success:false,

        message:"Unauthorized",

      });

    }



    const user =
      await User.findOne({

        clerkId:userId,

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



    return res.json({

      success:true,

      data:projects,

    });



  } catch(error:any) {


    console.log(
      "GET PROJECTS ERROR:",
      error.message
    );



    return res.status(500).json({

      success:false,

      message:
        "Failed to fetch projects",

      error:
        error.message,

    });


  }

};









export const getProjectById =
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

        success:false,

        message:
          "Project not found",

      });


    }



    return res.json({

      success:true,

      data:project,

    });



  } catch(error:any) {


    console.log(
      "GET PROJECT BY ID ERROR:",
      error.message
    );



    return res.status(500).json({

      success:false,

      message:
        "Failed to fetch project",

      error:
        error.message,

    });


  }

};









export const deleteProject =
async (
  req: Request,
  res: Response
) => {


  try {


    const userId =
      req.auth?.userId;



    if (!userId) {


      return res.status(401).json({

        success:false,

        message:"Unauthorized",

      });


    }



    const user =
      await User.findOne({

        clerkId:userId,

      });



    if (!user) {


      return res.status(404).json({

        success:false,

        message:"User not found",

      });


    }



    await Project.findOneAndDelete({

      _id:req.params.id,

      ownerId:user._id,

    });



    return res.json({

      success:true,

      message:
        "Project deleted successfully",

    });



  } catch(error:any) {


    console.log(
      "DELETE PROJECT ERROR:",
      error.message
    );



    return res.status(500).json({

      success:false,

      message:
        "Failed to delete project",

      error:
        error.message,

    });


  }

};