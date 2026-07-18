// import { Schema, model, Document } from "mongoose";

// import { UserRole } from "../enums/user-role.enum";
// import { SubscriptionPlan } from "../enums/subscription.enum";

// export interface IUser extends Document {
//   clerkId: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   imageUrl?: string;

//   role: UserRole;

//   subscription: SubscriptionPlan;

//   isActive: boolean;

//   createdAt: Date;
//   updatedAt: Date;
// }

// const userSchema = new Schema<IUser>(
//   {
//     clerkId: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     firstName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     lastName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     imageUrl: {
//       type: String,
//       default: "",
//     },

//     role: {
//       type: String,
//       enum: Object.values(UserRole),
//       default: UserRole.HOMEOWNER,
//     },

//     subscription: {
//       type: String,
//       enum: Object.values(SubscriptionPlan),
//       default: SubscriptionPlan.FREE,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const User = model<IUser>("User", userSchema);

// export default User;

import { Schema, model, Document } from "mongoose";

import { UserRole } from "../enums/user-role.enum";
import { SubscriptionPlan } from "../enums/subscription.enum";


export interface IUser extends Document {

  clerkId: string;

  email: string;

  firstName: string;

  lastName: string;

  imageUrl?: string;


  role: UserRole;

  subscription: SubscriptionPlan;

  isActive: boolean;


  createdAt: Date;

  updatedAt: Date;

}



const userSchema = new Schema<IUser>(

  {

    clerkId: {

      type: String,

      required: true,

      unique: true,

      index: true,

    },



    email: {

      type: String,

      required: true,

      unique: true,

      lowercase: true,

      trim: true,

    },



    firstName: {

      type: String,

      default: "",

      trim: true,

    },



    lastName: {

      type: String,

      default: "",

      trim: true,

    },



    imageUrl: {

      type: String,

      default: "",

    },



    role: {

      type: String,

      enum: Object.values(UserRole),

      default: UserRole.HOMEOWNER,

    },



    subscription: {

      type: String,

      enum: Object.values(SubscriptionPlan),

      default: SubscriptionPlan.FREE,

    },



    isActive: {

      type: Boolean,

      default: true,

    },


  },

  {

    timestamps:true,

  }

);



const User =
model<IUser>(
  "User",
  userSchema
);



export default User;