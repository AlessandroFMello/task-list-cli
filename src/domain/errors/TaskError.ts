/**
 * Base abstract class for all task-related errors
 */
export abstract class TaskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

