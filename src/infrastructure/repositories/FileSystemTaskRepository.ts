import { UUID } from "node:crypto";
import { ITaskRepository } from "../../domain/repositories/ITaskRepository.js";
import { ITask } from "../../interfaces/ITask.js";
import { IFileSystem } from "../file-system/IFileSystem.js";
import { FileSystemError } from "../errors/FileSystemError.js";

/**
 * File system implementation of ITaskRepository
 * Stores tasks in JSON files
 */
export class FileSystemTaskRepository implements ITaskRepository {
  constructor(
    private filePath: string,
    private fileSystem: IFileSystem
  ) {}

  async findAll(): Promise<ITask[]> {
    try {
      const exists = await this.fileSystem.exists(this.filePath);
      if (!exists) {
        return [];
      }

      const content = await this.fileSystem.readFile(this.filePath);
      
      if (!content.trim()) {
        return [];
      }

      const tasks = JSON.parse(content) as ITask[];

      if (!Array.isArray(tasks)) {
        throw new Error("Tasks file does not contain a valid array");
      }

      return tasks;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(
          `Invalid JSON in tasks file: ${this.filePath}. ${error.message}`
        );
      }
      if (error instanceof FileSystemError) {
        throw error;
      }
      throw new Error(
        `Error reading tasks file: ${this.filePath}. ${(error as Error).message}`
      );
    }
  }

  async findById(uuid: UUID): Promise<ITask | null> {
    const tasks = await this.findAll();
    return tasks.find((t) => t.uuid === uuid) || null;
  }

  async save(task: ITask): Promise<void> {
    if (!task.uuid) {
      throw new Error("Task must have a UUID to save");
    }

    const tasks = await this.findAll();
    const index = tasks.findIndex((t) => t.uuid === task.uuid);

    if (index !== -1) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }

    await this.saveAll(tasks);
  }

  async saveAll(tasks: ITask[]): Promise<void> {
    try {
      const directory = this.filePath.substring(0, this.filePath.lastIndexOf("/"));
      await this.fileSystem.ensureDirectory(directory);
      await this.fileSystem.writeFile(
        this.filePath,
        JSON.stringify(tasks, null, 2)
      );
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      throw new Error(
        `Error saving tasks file: ${this.filePath}. ${(error as Error).message}`
      );
    }
  }

  async delete(uuid: UUID): Promise<void> {
    const tasks = await this.findAll();
    const filtered = tasks.filter((t) => t.uuid !== uuid);
    await this.saveAll(filtered);
  }

  async exists(uuid: UUID): Promise<boolean> {
    const task = await this.findById(uuid);
    return task !== null;
  }
}

