import { Request, Response, NextFunction } from "express";
import { BaseError } from "../../shared/errors/base.error";
import { ValidationError } from "../../shared/errors/validation.error";
import { Logger } from "../../shared/logger";

const logger = new Logger("ErrorHandler");

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.error("Error occurred:", error);

  if (error instanceof ValidationError) {
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  if (error instanceof BaseError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "Internal server error",
  });
};
