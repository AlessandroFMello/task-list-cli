import { TaskFormatter } from "../../../presentation/formatters/TaskFormatter.js";
import { DateFormatter } from "../../../presentation/formatters/DateFormatter.js";
import { ITask } from "../../../interfaces/ITask.js";
import { UUID } from "node:crypto";

describe("TaskFormatter", () => {
  let formatter: TaskFormatter;

  beforeEach(() => {
    formatter = new TaskFormatter(new DateFormatter());
  });

  describe("format", () => {
    it("should format task correctly", () => {
      const task: ITask = {
        uuid: "123e4567-e89b-12d3-a456-426614174000" as UUID,
        description: "Test task",
        status: "todo",
        createdAt: "2024-01-15T10:00:00.000Z",
        updatedAt: "2024-01-15T11:00:00.000Z",
      };

      const formatted = formatter.format(task);

      expect(formatted).toContain("UUID: 123e4567-e89b-12d3-a456-426614174000");
      expect(formatted).toContain("Description: Test task");
      expect(formatted).toContain("Status: TODO");
      expect(formatted).toContain("Created:");
      expect(formatted).toContain("Updated:");
      expect(formatted).toContain("---");
    });

    it("should handle missing optional fields", () => {
      const task: ITask = {
        description: "Test task",
      };

      const formatted = formatter.format(task);

      expect(formatted).toContain("UUID: N/A");
      expect(formatted).toContain("Status: N/A");
      expect(formatted).toContain("Created: N/A");
      expect(formatted).toContain("Updated: N/A");
    });
  });

  describe("formatList", () => {
    it("should format list of tasks", () => {
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

      const formatted = formatter.formatList(tasks);

      expect(formatted).toContain("Task 1");
      expect(formatted).toContain("Task 2");
      expect(formatted).toContain("TODO");
      expect(formatted).toContain("DONE");
    });

    it("should return message for empty list", () => {
      const formatted = formatter.formatList([]);

      expect(formatted).toBe("No tasks found.");
    });
  });
});


