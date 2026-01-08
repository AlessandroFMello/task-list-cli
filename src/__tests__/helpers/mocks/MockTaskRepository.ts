import { ITaskRepository } from "../../../domain/repositories/ITaskRepository.js";
import { ITask } from "../../../interfaces/ITask.js";
import { UUID } from "node:crypto";

/**
 * Mock implementation of ITaskRepository for testing
 */
export class MockTaskRepository implements ITaskRepository {
  private tasks: ITask[] = [];

  async findAll(): Promise<ITask[]> {
    return [...this.tasks];
  }

  async findById(uuid: UUID): Promise<ITask | null> {
    return this.tasks.find((t) => t.uuid === uuid) || null;
  }

  async save(task: ITask): Promise<void> {
    const index = this.tasks.findIndex((t) => t.uuid === task.uuid);
    if (index !== -1) {
      this.tasks[index] = task;
    } else {
      this.tasks.push(task);
    }
  }

  async saveAll(tasks: ITask[]): Promise<void> {
    this.tasks = [...tasks];
  }

  async delete(uuid: UUID): Promise<void> {
    this.tasks = this.tasks.filter((t) => t.uuid !== uuid);
  }

  async exists(uuid: UUID): Promise<boolean> {
    return this.tasks.some((t) => t.uuid === uuid);
  }

  // Helper methods for testing
  clear(): void {
    this.tasks = [];
  }

  getTasks(): ITask[] {
    return [...this.tasks];
  }
}

