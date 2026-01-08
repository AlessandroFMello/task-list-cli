import { UUID } from "node:crypto";
import { ITaskRepository } from "../domain/repositories/ITaskRepository.js";
import { TaskNotFoundError } from "../domain/errors/TaskNotFoundError.js";

/**
 * Use case for deleting a task
 */
export class DeleteTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  /**
   * Execute the delete task use case
   * @param uuid - Task UUID to delete
   * @returns Promise that resolves when task is deleted
   * @throws TaskNotFoundError if task doesn't exist
   */
  async execute(uuid: UUID): Promise<void> {
    // Check if task exists
    const exists = await this.taskRepository.exists(uuid);
    if (!exists) {
      throw new TaskNotFoundError(uuid);
    }

    // Delete the task
    await this.taskRepository.delete(uuid);
  }
}

