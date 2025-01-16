import { BaseError } from "./base.error";

export class DomainError extends BaseError {
  constructor(message: string) {
    super("DOMAIN_ERROR", message, 400);
  }
}
