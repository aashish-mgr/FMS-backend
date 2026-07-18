import { Response } from "express";

export const sendSuccess = (
  res: Response,
  message: string,
  data?: unknown,
  status = 200,
  meta?: { page: number; limit: number; total: number; totalPages: number },
) => {
  return res
    .status(status)
    .json({ success: true, message, data, ...(meta ? { meta } : {}) });
};

export const sendError = (res: Response, message: string, status = 400, details?: unknown) => {
  return res.status(status).json({ success: false, message,details});
};
