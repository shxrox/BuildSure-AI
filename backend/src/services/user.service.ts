import { clerkClient } from "@clerk/express";

import User from "../models/user.model";
import { UserRole } from "../enums/user-role.enum";
import { SubscriptionPlan } from "../enums/subscription.enum";


interface CreateUserData {
  clerkId: string;
}


const createOrGetUser = async (
  data: CreateUserData
) => {

  const existingUser = await User.findOne({
    clerkId: data.clerkId,
  });


  if (existingUser) {
    return existingUser;
  }


  const clerkUser =
    await clerkClient.users.getUser(
      data.clerkId
    );


  const email =
    clerkUser.emailAddresses[0]?.emailAddress;


  if (!email) {
    throw new Error(
      "User email not found from Clerk"
    );
  }


  const newUser = await User.create({

    clerkId: clerkUser.id,

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

  });


  return newUser;
};


export default createOrGetUser;