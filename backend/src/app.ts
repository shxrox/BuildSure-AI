

// import express from "express";

// import cors from "cors";

// import morgan from "morgan";

// import {
//   clerkMiddleware,
// } from "@clerk/express";


// import projectRoutes from "./routes/project.routes";

// import userRoutes from "./routes/user.routes";



// const app =
//   express();




// app.use(

//   cors({

//     origin:
//       "http://localhost:5173",

//     credentials:true,

//   })

// );




// app.use(
//   express.json()
// );



// app.use(
//   morgan("dev")
// );




// // Clerk MUST come before routes
// app.use(
//   clerkMiddleware()
// );





// app.use(
//   "/api/v1/users",
//   userRoutes
// );



// app.use(
//   "/api/v1/projects",
//   projectRoutes
// );





// export default app;

import express from "express";
import cors from "cors";
import morgan from "morgan";

import {
  clerkMiddleware,
} from "@clerk/express";

import projectRoutes from "./routes/project.routes";
import userRoutes from "./routes/user.routes";


const app = express();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


app.use(express.json());
app.use(morgan("dev"));


// Clerk MUST come before routes
app.use(clerkMiddleware());


app.use(
  "/api/v1/users",
  userRoutes
);


app.use(
  "/api/v1/projects",
  projectRoutes
);


export default app;