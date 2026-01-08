import { ITaskRepository } from "../domain/repositories/ITaskRepository.js";
import { ITask } from "../interfaces/ITask.js";
import { TaskStatus, TaskStatusType } from "../domain/value-objects/TaskStatus.js";

/**
 * Use case for listing tasks, optionally filtered by status
 */
export class ListTasksUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  /**
   * Execute the list tasks use case
   * @param statusFilter - Optional status filter (can be CLI format like "in-progress")
   * @returns Promise resolving to array of tasks
   */
  async execute(statusFilter?: string): Promise<ITask[]> {
    // Get all tasks
    const allTasks = await this.taskRepository.findAll();

    // If no filter, return all tasks
    if (!statusFilter) {
      return allTasks;
    }

    // Normalize and validate status filter
    const normalizedStatus = TaskStatus.fromString(statusFilter);

    // Filter by status
    return allTasks.filter((task) => task.status === normalizedStatus);
  }
}

