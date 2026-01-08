import { ITaskRepository } from "../domain/repositories/ITaskRepository.js";

/**
 * Use case for clearing all tasks
 */
export class ClearAllTasksUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  /**
   * Execute the clear all tasks use case
   * @returns Promise that resolves when all tasks are cleared
   */
  async execute(): Promise<void> {
    // Save empty array to clear all tasks
    await this.taskRepository.saveAll([]);
  }
}

