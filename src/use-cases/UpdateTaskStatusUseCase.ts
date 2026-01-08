import { UUID } from "node:crypto";
import { ITaskRepository } from "../domain/repositories/ITaskRepository.js";
import { ITask } from "../interfaces/ITask.js";
import { TaskNotFoundError } from "../domain/errors/TaskNotFoundError.js";
import { Task } from "../domain/entities/Task.js";
import { TaskStatus } from "../domain/value-objects/TaskStatus.js";

/**
 * Use case for updating a task's status
 */
export class UpdateTaskStatusUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  /**
   * Execute the update task status use case
   * @param uuid - Task UUID
   * @param status - New task status (can be CLI format like "in-progress")
   * @returns Promise resolving to the updated task
   * @throws TaskNotFoundError if task doesn't exist
   * @throws InvalidTaskError if status is invalid
   */
  async execute(uuid: UUID, status: string): Promise<ITask> {
    // Find the task
    const existingTask = await this.taskRepository.findById(uuid);
    if (!existingTask) {
      throw new TaskNotFoundError(uuid);
    }

    // Create Task entity from existing data
    const task = Task.fromData(existingTask);
    task.updateStatus(status); // This validates and normalizes the status

    // Save updated task
    const updatedTask = task.toJSON();
    await this.taskRepository.save(updatedTask);

    return updatedTask;
  }
}

