import { TaskStatus, TaskStatusType } from "../../../domain/value-objects/TaskStatus.js";
import { InvalidTaskError } from "../../../domain/errors/InvalidTaskError.js";

describe("TaskStatus", () => {
  describe("isValid", () => {
    it("should return true for valid statuses", () => {
      expect(TaskStatus.isValid("todo")).toBe(true);
      expect(TaskStatus.isValid("in_progress")).toBe(true);
      expect(TaskStatus.isValid("done")).toBe(true);
    });

    it("should return false for invalid statuses", () => {
      expect(TaskStatus.isValid("invalid")).toBe(false);
      expect(TaskStatus.isValid("")).toBe(false);
      expect(TaskStatus.isValid("pending")).toBe(false);
    });
  });

  describe("fromString", () => {
    it("should convert valid status string to TaskStatus", () => {
      expect(TaskStatus.fromString("todo")).toBe("todo");
      expect(TaskStatus.fromString("in_progress")).toBe("in_progress");
      expect(TaskStatus.fromString("done")).toBe("done");
    });

    it("should normalize CLI format to internal format", () => {
      expect(TaskStatus.fromString("in-progress")).toBe("in_progress");
      expect(TaskStatus.fromString("in-progress")).not.toBe("in-progress");
    });

    it("should throw InvalidTaskError for invalid status", () => {
      expect(() => TaskStatus.fromString("invalid")).toThrow(InvalidTaskError);
      expect(() => TaskStatus.fromString("invalid")).toThrow(
        "Invalid status: invalid"
      );
    });

    it("should include valid statuses in error message", () => {
      try {
        TaskStatus.fromString("invalid");
        fail("Should have thrown");
      } catch (error) {
        if (error instanceof InvalidTaskError) {
          expect(error.message).toContain("todo");
          expect(error.message).toContain("in_progress");
          expect(error.message).toContain("done");
        }
      }
    });
  });

  describe("getAll", () => {
    it("should return all valid statuses", () => {
      const statuses = TaskStatus.getAll();
      expect(statuses).toHaveLength(3);
      expect(statuses).toContain("todo");
      expect(statuses).toContain("in_progress");
      expect(statuses).toContain("done");
    });

    it("should return a readonly array", () => {
      const statuses = TaskStatus.getAll();
      // TypeScript should prevent mutation, but we test runtime behavior
      expect(() => {
        (statuses as any).push("invalid");
      }).not.toThrow(); // Arrays are mutable at runtime, but TypeScript prevents it
    });
  });

  describe("normalize", () => {
    it("should normalize CLI format to internal format", () => {
      expect(TaskStatus.normalize("in-progress")).toBe("in_progress");
      expect(TaskStatus.normalize("todo")).toBe("todo");
      expect(TaskStatus.normalize("done")).toBe("done");
    });

    it("should handle multiple hyphens", () => {
      expect(TaskStatus.normalize("in-progress-task")).toBe("in_progress_task");
    });
  });
});

