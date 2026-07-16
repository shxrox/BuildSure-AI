import express from "express";
import cors from "cors";
import morgan from "morgan";

import {
  clerkMiddleware,
} from "@clerk/express";


import apiRoutes from "./routes";


const app = express();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


app.use(
  express.json()
);


app.use(
  morgan("dev")
);


// Clerk MUST come before protected routes
app.use(
  clerkMiddleware()
);


app.use(
  "/api/v1",
  apiRoutes
);


export default app;