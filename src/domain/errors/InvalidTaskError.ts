import { TaskError } from "./TaskError.js";

/**
 * Error thrown when task data is invalid
 */
export class InvalidTaskError extends TaskError {
  constructor(message: string) {
    super(`Invalid task: ${message}`);
  }
}

