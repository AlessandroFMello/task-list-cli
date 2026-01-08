import { UUID } from "node:crypto";
import { ITask } from "../../interfaces/ITask.js";

/**
 * Repository interface for task persistence
 * Abstracts data access layer from domain logic
 */
export interface ITaskRepository {
  /**
   * Find all tasks
   * @returns Promise resolving to array of all tasks
   */
  findAll(): Promise<ITask[]>;

  /**
   * Find task by UUID
   * @param uuid - Task UUID
   * @returns Promise resolving to task or null if not found
   */
  findById(uuid: UUID): Promise<ITask | null>;

  /**
   * Save a task (create or update)
   * @param task - Task to save
   * @returns Promise that resolves when task is saved
   */
  save(task: ITask): Promise<void>;

  /**
   * Save multiple tasks
   * @param tasks - Array of tasks to save
   * @returns Promise that resolves when all tasks are saved
   */
  saveAll(tasks: ITask[]): Promise<void>;

  /**
   * Delete a task by UUID
   * @param uuid - Task UUID to delete
   * @returns Promise that resolves when task is deleted
   */
  delete(uuid: UUID): Promise<void>;

  /**
   * Check if a task exists
   * @param uuid - Task UUID to check
   * @returns Promise resolving to true if task exists, false otherwise
   */
  exists(uuid: UUID): Promise<boolean>;
}

