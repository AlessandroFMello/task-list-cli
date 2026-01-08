import { InvalidTaskError } from "../errors/InvalidTaskError.js";

/**
 * TaskStatus value object with validation methods
 * Maps CLI format ("in-progress") to internal format ("in_progress")
 */
export class TaskStatus {
  private static readonly VALID_STATUSES = [
    "todo",
    "in_progress",
    "done",
  ] as const;

  /**
   * Type guard to check if a string is a valid TaskStatus
   */
  static isValid(status: string): status is TaskStatusType {
    return this.VALID_STATUSES.includes(status as TaskStatusType);
  }

  /**
   * Convert string to TaskStatus, normalizing CLI format to internal format
   * @param status - Status string (e.g., "in-progress" or "in_progress")
   * @returns Valid TaskStatus
   * @throws InvalidTaskError if status is invalid
   */
  static fromString(status: string): TaskStatusType {
    // Normalize CLI format to internal format
    const normalized = status.replace(/-/g, "_");

    if (!this.isValid(normalized)) {
      throw new InvalidTaskError(
        `Invalid status: ${status}. Valid statuses are: ${this.VALID_STATUSES.join(", ")}`
      );
    }

    return normalized;
  }

  /**
   * Get all valid statuses
   */
  static getAll(): readonly TaskStatusType[] {
    return [...this.VALID_STATUSES];
  }

  /**
   * Normalize status from CLI format to internal format
   * @param status - Status string from CLI
   * @returns Normalized status
   */
  static normalize(status: string): string {
    return status.replace(/-/g, "_");
  }
}

// Export the type for use in other files
// Accessing private static property through type inference
export type TaskStatusType = "todo" | "in_progress" | "done";

