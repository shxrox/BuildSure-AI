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
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      thickness: number;
      height: number;
    }[];

    rooms: {
      id: string;
      name: string;
      points: {
        x: number;
        y: number;
      }[];
      areaSqm?: number;
      color?: string;
    }[];

    doors: {
      id: string;
      x: number;
      y: number;
      width: number;
      angle: number;
    }[];

    windows: {
      id: string;
      x: number;
      y: number;
      width: number;
      angle: number;
    }[];

    furniture: {
      id: string;
      name: string;
      category: string;
      icon: string;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
    }[];
  };

  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
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
      fileName: String,
      fileType: String,
      fileData: Buffer,
      uploadedAt: Date,
    },
    digitalPlan: {
      walls: [{
        id: String,
        startX: Number,
        startY: Number,
        endX: Number,
        endY: Number,
        thickness: Number,
        height: Number,
      }],
      rooms: [{
        id: String,
        name: String,
        points: [{
          x: Number,
          y: Number,
        }],
        areaSqm: Number,
        color: String,
      }],
      doors: [{
        id: String,
        x: Number,
        y: Number,
        width: Number,
        angle: Number,
      }],
      windows: [{
        id: String,
        x: Number,
        y: Number,
        width: Number,
        angle: Number,
      }],
      furniture: [{
        id: String,
        name: String,
        category: String,
        icon: String,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        rotation: Number,
      }],
    },
  },
  {
    timestamps: true,
  }
);

const Project = model<IProject>("Project", projectSchema);

export default Project;