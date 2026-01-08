import { FileSystemTaskRepository } from "../../../infrastructure/repositories/FileSystemTaskRepository.js";
import { ITaskRepository } from "../../../domain/repositories/ITaskRepository.js";
import { IFileSystem } from "../../../infrastructure/file-system/IFileSystem.js";
import { ITask } from "../../../interfaces/ITask.js";
import { UUID } from "node:crypto";
import { FileSystemError } from "../../../infrastructure/errors/FileSystemError.js";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { NodeFileSystem } from "../../../infrastructure/file-system/NodeFileSystem.js";

describe("FileSystemTaskRepository", () => {
  let repository: ITaskRepository;
  let fileSystem: IFileSystem;
  let testDir: string;
  let testFilePath: string;

  beforeEach(() => {
    fileSystem = new NodeFileSystem();
    testDir = join(tmpdir(), `repo-test-${Date.now()}`);
    testFilePath = join(testDir, "tasks.json");
    mkdirSync(testDir, { recursive: true });
    repository = new FileSystemTaskRepository(testFilePath, fileSystem);
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("findAll", () => {
    it("should return empty array if file doesn't exist", async () => {
      const tasks = await repository.findAll();
      expect(tasks).toEqual([]);
    });

    it("should return empty array if file is empty", async () => {
      await fileSystem.writeFile(testFilePath, "");

      const tasks = await repository.findAll();
      expect(tasks).toEqual([]);
    });

    it("should return tasks from file", async () => {
      const tasksData: ITask[] = [
        {
          uuid: "123e4567-e89b-12d3-a456-426614174000" as UUID,
          description: "Task 1",
          status: "todo",
        },
        {
          uuid: "223e4567-e89b-12d3-a456-426614174000" as UUID,
          description: "Task 2",
          status: "in_progress",
        },
      ];

      await fileSystem.writeFile(testFilePath, JSON.stringify(tasksData));

      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(2);
      expect(tasks[0].description).toBe("Task 1");
      expect(tasks[1].description).toBe("Task 2");
    });

    it("should throw error if JSON is invalid", async () => {
      await fileSystem.writeFile(testFilePath, "invalid json");

      await expect(repository.findAll()).rejects.toThrow("Invalid JSON");
    });

    it("should throw error if file doesn't contain array", async () => {
      await fileSystem.writeFile(testFilePath, '{"not": "an array"}');

      await expect(repository.findAll()).rejects.toThrow("valid array");
    });
  });

  describe("findById", () => {
    it("should return task if found", async () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;
      const task: ITask = {
        uuid,
        description: "Test task",
        status: "todo",
      };

      await repository.save(task);

      const found = await repository.findById(uuid);
      expect(found).toEqual(task);
    });

    it("should return null if not found", async () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;

      const found = await repository.findById(uuid);
      expect(found).toBeNull();
    });
  });

  describe("save", () => {
    it("should add new task", async () => {
      const task: ITask = {
        uuid: "123e4567-e89b-12d3-a456-426614174000" as UUID,
        description: "New task",
        status: "todo",
      };

      await repository.save(task);

      const found = await repository.findById(task.uuid!);
      expect(found).toEqual(task);
    });

    it("should update existing task", async () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;
      const task: ITask = {
        uuid,
        description: "Original",
        status: "todo",
      };

      await repository.save(task);

      const updated: ITask = {
        uuid,
        description: "Updated",
        status: "in_progress",
      };

      await repository.save(updated);

      const found = await repository.findById(uuid);
      expect(found?.description).toBe("Updated");
      expect(found?.status).toBe("in_progress");
    });

    it("should throw error if task has no UUID", async () => {
      const task: ITask = {
        description: "Task without UUID",
      };

      await expect(repository.save(task)).rejects.toThrow("UUID");
    });
  });

  describe("saveAll", () => {
    it("should save all tasks", async () => {
      const tasks: ITask[] = [
        {
          uuid: "123e4567-e89b-12d3-a456-426614174000" as UUID,
          description: "Task 1",
          status: "todo",
        },
        {
          uuid: "223e4567-e89b-12d3-a456-426614174000" as UUID,
          description: "Task 2",
          status: "done",
        },
      ];

      await repository.saveAll(tasks);

      const all = await repository.findAll();
      expect(all).toHaveLength(2);
    });

    it("should overwrite existing tasks", async () => {
      const task1: ITask = {
        uuid: "123e4567-e89b-12d3-a456-426614174000" as UUID,
        description: "Task 1",
        status: "todo",
      };

      await repository.save(task1);

      const newTasks: ITask[] = [
        {
          uuid: "223e4567-e89b-12d3-a456-426614174000" as UUID,
          description: "Task 2",
          status: "done",
        },
      ];

      await repository.saveAll(newTasks);

      const all = await repository.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].uuid).toBe(newTasks[0].uuid);
    });
  });

  describe("delete", () => {
    it("should delete task", async () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;
      const task: ITask = {
        uuid,
        description: "Task to delete",
        status: "todo",
      };

      await repository.save(task);
      await repository.delete(uuid);

      const found = await repository.findById(uuid);
      expect(found).toBeNull();
    });

    it("should not throw if task doesn't exist", async () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;

      await expect(repository.delete(uuid)).resolves.not.toThrow();
    });
  });

  describe("exists", () => {
    it("should return true if task exists", async () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;
      const task: ITask = {
        uuid,
        description: "Test task",
        status: "todo",
      };

      await repository.save(task);

      const exists = await repository.exists(uuid);
      expect(exists).toBe(true);
    });

    it("should return false if task doesn't exist", async () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;

      const exists = await repository.exists(uuid);
      expect(exists).toBe(false);
    });
  });
});

