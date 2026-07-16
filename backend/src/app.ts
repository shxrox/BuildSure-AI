import express from "express";
import cors from "cors";
import morgan from "morgan";

import {
  clerkMiddleware,
} from "@clerk/express";


import projectRoutes from "./routes/project.routes";
import userRoutes from "./routes/user.routes";


const app = express();



// Middleware

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


// IMPORTANT
// Clerk must come before routes
app.use(
  clerkMiddleware()
);




// Routes

app.use(
  "/api/v1/users",
  userRoutes
);


app.use(
  "/api/v1/projects",
  projectRoutes
);




// Health check

app.get(
  "/",
  (
    req,
    res
  ) => {

    res.json({
      success: true,
      message: "BuildSure-AI API running",
    });

  }
);



export default app;