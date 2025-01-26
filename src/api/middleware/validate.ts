import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import { ValidationError } from "../../shared/errors/validation.error";

export interface ValidationOptions {
  source?: "body" | "query" | "params";
  stripUnknown?: boolean;
}

const defaultOptions: ValidationOptions = {
  source: "body",
  stripUnknown: true,
};

export const validate = (schema: Schema, options: ValidationOptions = {}) => {
  const { source = "body", stripUnknown } = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = req[source as keyof Request];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      throw new ValidationError("Validation failed", errors);
    }

    // Only assign to mutable properties
    if (source === "body" || source === "query" || source === "params") {
      req[source] = value;
    }

    next();
  };
};
