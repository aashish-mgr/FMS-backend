import { Response } from "express";


export const sendSuccess = (res: Response, message: string, data?: unknown, status = 200) => {
  return res.status(status).json({ message, data });
};

export const sendError = (res: Response, message: string, status = 400) => {
  return res.status(status).json({ message });
};
