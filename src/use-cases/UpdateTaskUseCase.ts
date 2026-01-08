import { UUID } from "node:crypto";
import { ITaskRepository } from "../domain/repositories/ITaskRepository.js";
import { ITask } from "../interfaces/ITask.js";
import { TaskNotFoundError } from "../domain/errors/TaskNotFoundError.js";
import { Task } from "../domain/entities/Task.js";

/**
 * Use case for updating a task's description
 */
export class UpdateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  /**
   * Execute the update task use case
   * @param uuid - Task UUID
   * @param description - New task description
   * @returns Promise resolving to the updated task
   * @throws TaskNotFoundError if task doesn't exist
   * @throws InvalidTaskError if description is invalid
   */
  async execute(uuid: UUID, description: string): Promise<ITask> {
    // Find the task
    const existingTask = await this.taskRepository.findById(uuid);
    if (!existingTask) {
      throw new TaskNotFoundError(uuid);
    }

    // Create Task entity from existing data to use validation methods
    const task = Task.fromData(existingTask);
    task.updateDescription(description);

    // Save updated task
    const updatedTask = task.toJSON();
    await this.taskRepository.save(updatedTask);

    return updatedTask;
  }
}

