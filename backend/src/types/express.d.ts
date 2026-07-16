import type { AuthObject } from "@clerk/express";
import type { IUser } from "../models/user.model";

declare global {
  namespace Express {

    interface Request {
      auth: AuthObject;
      user?: IUser;
    }

  }
}

export {};