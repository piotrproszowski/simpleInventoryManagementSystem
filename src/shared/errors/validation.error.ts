import { BaseError } from "./base.error";

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class ValidationError extends BaseError {
  constructor(
    message: string,
    public readonly details: ValidationErrorDetail[] = [],
  ) {
    super("VALIDATION_ERROR", message, 400);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
