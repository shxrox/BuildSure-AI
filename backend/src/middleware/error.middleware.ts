import { Request, Response, NextFunction } from "express";

const errorMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};

export default errorMiddleware;