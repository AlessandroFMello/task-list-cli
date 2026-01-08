import { UUID } from "node:crypto";
import { TaskError } from "./TaskError.js";

/**
 * Error thrown when a task with the specified UUID is not found
 */
export class TaskNotFoundError extends TaskError {
  constructor(uuid: UUID) {
    super(`Task with UUID ${uuid} not found`);
  }
}

