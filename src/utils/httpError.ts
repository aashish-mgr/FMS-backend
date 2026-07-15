interface HttpError extends Error {
  statusCode?: number;
}

export const httpError = (message: string, statusCode: number): HttpError => {
  const err: HttpError = new Error(message);
  err.statusCode = statusCode;
  return err;
};