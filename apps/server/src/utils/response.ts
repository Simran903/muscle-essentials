import type { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "",
  status = 200,
): void {
  res.status(status).json({
    success: true,
    data,
    message,
  });
}

export function sendError(
  res: Response,
  message: string,
  error = "",
  status = 400,
): void {
  res.status(status).json({
    success: false,
    message,
    error,
  });
}
