import {
  Schema,
  model,
  Document,
  Types,
} from "mongoose";



export interface IProject extends Document {

  ownerId: Types.ObjectId;

  projectName: string;

  location: string;

  description: string;

  status:
    | "PLANNING"
    | "IN_PROGRESS"
    | "COMPLETED";

  blueprint?: {

    fileName: string;

    fileType: string;

    fileUrl: string;

    uploadedAt: Date;

  };

  createdAt: Date;

  updatedAt: Date;

}





const projectSchema =
new Schema<IProject>(

{

  ownerId: {

    type: Schema.Types.ObjectId,

    ref: "User",

    required: true,

  },



  projectName: {

    type: String,

    required: true,

    trim: true,

  },



  location: {

    type: String,

    required: true,

    trim: true,

  },



  description: {

    type: String,

    default: "",

  },



  status: {

    type: String,

    enum: [

      "PLANNING",

      "IN_PROGRESS",

      "COMPLETED",

    ],

    default: "PLANNING",

  },





  blueprint: {

    fileName: {

      type: String,

    },


    fileType: {

      type: String,

    },


    fileUrl: {

      type: String,

    },


    uploadedAt: {

      type: Date,

    },

  },


},

{

  timestamps: true,

}

);






const Project =
model<IProject>(

  "Project",

  projectSchema

);



export default Project;