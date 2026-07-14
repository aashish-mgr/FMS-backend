import { Response } from "express";

// Small, optional helpers for new modules to use. Not wired into the
// auth/income controllers, since those already had an established
// `{ message, data }` response shape that changing here would break —
// this is here so new modules (expense, note, reminder, ...) have a
// consistent place to build responses from as they're implemented.
export const sendSuccess = (res: Response, message: string, data?: unknown, status = 200) => {
  return res.status(status).json({ message, data });
};

export const sendError = (res: Response, message: string, status = 400) => {
  return res.status(status).json({ message });
};
