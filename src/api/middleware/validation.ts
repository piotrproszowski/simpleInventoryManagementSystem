import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";

export const validate =
  (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(({ path, message }) => ({
        field: path.join("."),
        message,
      }));
      res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors,
      });
    } else {
      next();
    }
  };
