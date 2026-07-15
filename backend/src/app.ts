import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { API_PREFIX } from "./config/constants";
import routes from "./routes";

import notFoundMiddleware from "./middleware/notFound.middleware";
import errorMiddleware from "./middleware/error.middleware";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(`${API_PREFIX}`, routes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;