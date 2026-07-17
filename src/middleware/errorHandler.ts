import { Request, Response, NextFunction } from "express";

// Unchanged from the original src/middleware/errorHandler.ts: wraps an async
// route handler so a rejected promise is forwarded to Express's error
// pipeline instead of crashing the process. Kept the same export name
// (`handleError`) so existing route files don't need to change their imports.


export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const handleError = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// New: a true Express error-handling middleware (4-arg signature), matching
// what the SRS folder structure calls "Global error handler" and describing
// (Section 16.4). Register this LAST in app.ts, after all routes.
//
// Response shape intentionally kept as the original controllers already used
// (`{ message }`), rather than switching to the SRS's `{ success, error }`
// envelope, so nothing that already calls this API breaks. Errors thrown from
// service functions can set `err.statusCode` to control the HTTP status.
interface HttpError extends Error {
  statusCode?: number;
}

const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  return res.status(err.statusCode ?? 500).json({
    message: err.message || "Error occured",
  });

  
};



export { handleError, globalErrorHandler };
