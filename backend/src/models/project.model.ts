
import mongoose, {
  Schema,
  model,
  Document,
} from "mongoose";



export interface IProject extends Document {


  ownerId: mongoose.Types.ObjectId;


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

    fileData: Buffer;

    uploadedAt: Date;

  };



  digitalPlan?: {


    walls: {


      id: string;


      start: {

        x: number;

        y: number;

      };


      end: {

        x: number;

        y: number;

      };


      thickness: number;


    }[];



    rooms: {


      id: string;


      name: string;


      points: {


        x:number;

        y:number;


      }[];


      area?: number;


    }[];





    doors: {


      id:string;


      x:number;


      y:number;


      width:number;


    }[];





    windows: {


      id:string;


      x:number;


      y:number;


      width:number;


    }[];





  };



  createdAt: Date;


  updatedAt: Date;


}









const projectSchema =
new Schema<IProject>(

{


  ownerId: {


    type:
      Schema.Types.ObjectId,


    ref:
      "User",


    required:
      true,


  },





  projectName:{


    type:String,


    required:true,


    trim:true,


  },





  location:{


    type:String,


    required:true,


    trim:true,


  },





  description:{


    type:String,


    default:"",


  },





  status:{


    type:String,


    enum:[


      "PLANNING",


      "IN_PROGRESS",


      "COMPLETED",


    ],


    default:"PLANNING",


  },








  blueprint:{


    fileName:String,


    fileType:String,


    fileData:Buffer,


    uploadedAt:Date,


  },







  digitalPlan:{


    walls:[{


      id:String,


      start:{


        x:Number,


        y:Number,


      },


      end:{


        x:Number,


        y:Number,


      },


      thickness:Number,


    }],





    rooms:[{


      id:String,


      name:String,


      points:[{


        x:Number,


        y:Number,


      }],


      area:Number,


    }],






    doors:[{


      id:String,


      x:Number,


      y:Number,


      width:Number,


    }],






    windows:[{


      id:String,


      x:Number,


      y:Number,


      width:Number,


    }],


  },





},


{


  timestamps:true,


}

);









const Project =
model<IProject>(

"Project",

projectSchema

);





export default Project;