import { Response } from "express";

interface ApiResponseData {
  success: boolean;
  message: string;
  data?: unknown;
}

export const successResponse = (
  res: Response,
  message: string,
  data?: unknown,
  statusCode = 200
) => {
  const response: ApiResponseData = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};