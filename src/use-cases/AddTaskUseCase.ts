import { ITaskRepository } from "../domain/repositories/ITaskRepository.js";
import { ITask } from "../interfaces/ITask.js";
import { Task } from "../domain/entities/Task.js";
import { InvalidTaskError } from "../domain/errors/InvalidTaskError.js";

/**
 * Use case for adding a new task
 */
export class AddTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  /**
   * Execute the add task use case
   * @param description - Task description
   * @returns Promise resolving to the created task
   * @throws InvalidTaskError if description is invalid
   */
  async execute(description: string): Promise<ITask> {
    // Task.create() already validates description
    // (not empty, trimmed, max 500 characters)
    const task = Task.create(description);

    // Persist the task
    await this.taskRepository.save(task);

    return task;
  }
}

