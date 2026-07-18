// import { createClerkClient } from "@clerk/backend";

// import User from "../models/user.model";
// import { UserRole } from "../enums/user-role.enum";
// import { SubscriptionPlan } from "../enums/subscription.enum";


// const clerkClient = createClerkClient({
//   secretKey: process.env.CLERK_SECRET_KEY,
// });


// interface CreateUserData {
//   clerkId: string;
// }


// const createOrGetUser = async (
//   data: CreateUserData
// ) => {

//   const existingUser =
//   await User.findOne({
//     clerkId: data.clerkId,
//   });


// if (existingUser) {
//   return existingUser;
// }


//   const clerkUser =
//     await clerkClient.users.getUser(
//       data.clerkId
//     );


//   const email =
//     clerkUser.emailAddresses[0]
//       ?.emailAddress;
//   const existingEmailUser =
//   await User.findOne({
//     email,
//   });


// if (existingEmailUser) {

//   existingEmailUser.clerkId =
//     data.clerkId;

//   await existingEmailUser.save();

//   return existingEmailUser;

// }

//   if (!email) {
//     throw new Error(
//       "User email not found from Clerk"
//     );
//   }


//   const newUser =
//     await User.create({

//       clerkId:
//         clerkUser.id,

//       email,

//       firstName:
//         clerkUser.firstName || "",

//       lastName:
//         clerkUser.lastName || "",

//       imageUrl:
//         clerkUser.imageUrl || "",

//       role:
//         UserRole.HOMEOWNER,

//       subscription:
//         SubscriptionPlan.FREE,

//     });


//   return newUser;

// };


// export default createOrGetUser;

import { createClerkClient } from "@clerk/backend";

import User from "../models/user.model";

import {
  UserRole
} from "../enums/user-role.enum";

import {
  SubscriptionPlan
} from "../enums/subscription.enum";




const clerkClient =
createClerkClient({

  secretKey:
  process.env.CLERK_SECRET_KEY,

});




interface CreateUserData {

  clerkId:string;

}





const createOrGetUser = async (

  data:CreateUserData

)=>{


  try {


    // Check existing database user

    const existingUser =
    await User.findOne({

      clerkId:data.clerkId,

    });



    if(existingUser){

      return existingUser;

    }





    // Get user from Clerk

    const clerkUser =
    await clerkClient.users.getUser(

      data.clerkId

    );






    const email =
    clerkUser.emailAddresses[0]
    ?.emailAddress;




    if(!email){

      throw new Error(
        "User email not found from Clerk"
      );

    }






    // Check email already exists

    const existingEmailUser =
    await User.findOne({

      email,

    });





    if(existingEmailUser){


      existingEmailUser.clerkId =
      data.clerkId;



      await existingEmailUser.save();



      return existingEmailUser;


    }







    const newUser =
    await User.create({


      clerkId:
      clerkUser.id,



      email,



      firstName:
      clerkUser.firstName || "",



      lastName:
      clerkUser.lastName || "",



      imageUrl:
      clerkUser.imageUrl || "",



      role:
      UserRole.HOMEOWNER,



      subscription:
      SubscriptionPlan.FREE,



      isActive:true,


    });






    return newUser;



  }

  catch(error){


    console.error(
      "CREATE USER ERROR:",
      error
    );


    throw error;


  }



};




export default createOrGetUser;