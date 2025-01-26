import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: any[],
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      errors: err.errors,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(403).json({
      status: "error",
      message: "Validation failed",
      errors: Object.values(err).map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }

  if (err.name === "MongoError" && (err as any).code === 11000) {
    return res.status(409).json({
      status: "error",
      message: "Duplicate entry",
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
