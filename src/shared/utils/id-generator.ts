import {
  v4 as uuidv4,
  validate as uuidValidate,
  version as uuidVersion,
} from "uuid";

export class IdGenerator {
  /**
   * Generates a new UUID v4
   * @returns string UUID
   */
  static generate(): string {
    return uuidv4();
  }

  /**
   * Validates if a string is a valid UUID v4
   * @param id - The string to validate
   * @returns boolean
   */
  static isValid(id: string): boolean {
    return uuidValidate(id) && uuidVersion(id) === 4;
  }

  /**
   * Generates a new UUID v4 or validates and returns an existing one
   * @param existingId - Optional existing ID to validate
   * @returns string UUID
   * @throws Error if existingId is invalid
   */
  static generateOrValidate(existingId?: string): string {
    if (!existingId) {
      return this.generate();
    }

    if (!this.isValid(existingId)) {
      throw new Error("Invalid UUID format");
    }

    return existingId;
  }

  /**
   * Generates multiple UUIDs
   * @param count - Number of UUIDs to generate
   * @returns Array of UUIDs
   */
  static generateBatch(count: number): string[] {
    return Array.from({ length: count }, () => this.generate());
  }
}

export type EntityId = string;

export function isEntityId(id: unknown): id is EntityId {
  return typeof id === "string" && IdGenerator.isValid(id);
}
