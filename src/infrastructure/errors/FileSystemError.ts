import { TaskError } from "../../domain/errors/TaskError.js";

/**
 * Error thrown when file system operations fail
 */
export class FileSystemError extends TaskError {
  constructor(message: string, public readonly code?: string) {
    super(message);
  }
}

