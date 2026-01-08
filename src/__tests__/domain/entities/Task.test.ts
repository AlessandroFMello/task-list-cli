import { Task } from "../../../domain/entities/Task.js";
import { InvalidTaskError } from "../../../domain/errors/InvalidTaskError.js";
import { ITask } from "../../../interfaces/ITask.js";

describe("Task", () => {
  describe("create", () => {
    it("should create task with valid description", () => {
      const task = Task.create("Test task");
      expect(task.description).toBe("Test task");
      expect(task.status).toBe("todo");
      expect(task.uuid).toBeDefined();
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it("should trim description whitespace", () => {
      const task = Task.create("  Test task  ");
      expect(task.description).toBe("Test task");
    });

    it("should throw InvalidTaskError if description is empty", () => {
      expect(() => Task.create("")).toThrow(InvalidTaskError);
      expect(() => Task.create("   ")).toThrow(InvalidTaskError);
    });

    it("should throw InvalidTaskError if description exceeds 500 characters", () => {
      const longDescription = "a".repeat(501);
      expect(() => Task.create(longDescription)).toThrow(InvalidTaskError);
      expect(() => Task.create(longDescription)).toThrow(
        "Description cannot exceed 500 characters"
      );
    });

    it("should allow description with exactly 500 characters", () => {
      const description = "a".repeat(500);
      const task = Task.create(description);
      expect(task.description).toBe(description);
    });

    it("should generate unique UUIDs", () => {
      const task1 = Task.create("Task 1");
      const task2 = Task.create("Task 2");
      expect(task1.uuid).not.toBe(task2.uuid);
    });

    it("should set default status to todo", () => {
      const task = Task.create("Test task");
      expect(task.status).toBe("todo");
    });
  });

  describe("fromData", () => {
    it("should create Task from existing data", () => {
      const data: ITask = {
        uuid: "123e4567-e89b-12d3-a456-426614174000",
        description: "Existing task",
        status: "in_progress",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      };

      const task = Task.fromData(data);
      expect(task.uuid).toBe(data.uuid);
      expect(task.description).toBe(data.description);
      expect(task.status).toBe(data.status);
      expect(task.createdAt).toBe(data.createdAt);
      expect(task.updatedAt).toBe(data.updatedAt);
    });

    it("should use defaults for optional fields", () => {
      const data: ITask = {
        description: "Task without optional fields",
      };

      const task = Task.fromData(data);
      expect(task.uuid).toBeDefined();
      expect(task.status).toBe("todo");
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });
  });

  describe("updateDescription", () => {
    it("should update description", () => {
      const task = Task.fromData({ description: "Original" });
      const originalUpdatedAt = task.updatedAt;

      // Wait a bit to ensure timestamp changes
      return new Promise((resolve) => {
        setTimeout(() => {
          task.updateDescription("Updated");
          expect(task.description).toBe("Updated");
          expect(task.updatedAt).not.toBe(originalUpdatedAt);
          resolve(undefined);
        }, 10);
      });
    });

    it("should trim description when updating", () => {
      const task = Task.fromData({ description: "Original" });
      task.updateDescription("  Updated  ");
      expect(task.description).toBe("Updated");
    });

    it("should throw InvalidTaskError if new description is invalid", () => {
      const task = Task.fromData({ description: "Original" });
      expect(() => task.updateDescription("")).toThrow(InvalidTaskError);
      expect(() => task.updateDescription("a".repeat(501))).toThrow(
        InvalidTaskError
      );
    });
  });

  describe("updateStatus", () => {
    it("should update status", () => {
      const task = Task.fromData({ description: "Test" });
      const originalUpdatedAt = task.updatedAt;

      return new Promise((resolve) => {
        setTimeout(() => {
          task.updateStatus("in_progress");
          expect(task.status).toBe("in_progress");
          expect(task.updatedAt).not.toBe(originalUpdatedAt);
          resolve(undefined);
        }, 10);
      });
    });

    it("should normalize CLI format status", () => {
      const task = Task.fromData({ description: "Test" });
      task.updateStatus("in-progress");
      expect(task.status).toBe("in_progress");
    });

    it("should throw InvalidTaskError for invalid status", () => {
      const task = Task.fromData({ description: "Test" });
      expect(() => task.updateStatus("invalid")).toThrow(InvalidTaskError);
    });
  });

  describe("toJSON", () => {
    it("should return ITask object", () => {
      const task = Task.fromData({
        uuid: "123e4567-e89b-12d3-a456-426614174000",
        description: "Test task",
        status: "done",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      });

      const json = task.toJSON();
      expect(json).toEqual({
        uuid: "123e4567-e89b-12d3-a456-426614174000",
        description: "Test task",
        status: "done",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      });
    });
  });
});

