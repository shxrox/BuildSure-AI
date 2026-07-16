import express from "express";
import cors from "cors";

import authMiddleware from "./middleware/auth.middleware";
import routes from "./routes";


const app = express();


app.use(cors());

app.use(express.json());


app.use(authMiddleware);


app.use("/api/v1", routes);


export default app;