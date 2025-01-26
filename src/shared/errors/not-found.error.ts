import { BaseError } from "./base.error";

export class NotFoundError extends BaseError {
  constructor(resource: string) {
    super("NOT_FOUND", `${resource} not found`, 404);
  }
}
