import { LsCommand } from "../../../presentation/commands/LsCommand.js";
import { ListTasksUseCase } from "../../../use-cases/ListTasksUseCase.js";
import { TaskFormatter } from "../../../presentation/formatters/TaskFormatter.js";
import { DateFormatter } from "../../../presentation/formatters/DateFormatter.js";
import { IParsedArgs } from "../../../interfaces/IParsedArgs.js";
import { ITask } from "../../../interfaces/ITask.js";
import { UUID } from "node:crypto";

// Mock ListTasksUseCase
class MockListTasksUseCase {
  constructor(private tasks: ITask[]) {}
  async execute(statusFilter?: string): Promise<ITask[]> {
    if (!statusFilter) {
      return this.tasks;
    }
    return this.tasks.filter(t => t.status === statusFilter);
  }
}

describe("LsCommand", () => {
  let lsCommand: LsCommand;
  let taskFormatter: TaskFormatter;

  beforeEach(() => {
    const dateFormatter = new DateFormatter();
    taskFormatter = new TaskFormatter(dateFormatter);
    const mockUseCase = new MockListTasksUseCase([]) as any;
    lsCommand = new LsCommand(mockUseCase, taskFormatter);
  });

  describe("canHandle", () => {
    it("should handle ls command", () => {
      expect(lsCommand.canHandle("ls")).toBe(true);
    });

    it("should not handle other commands", () => {
      expect(lsCommand.canHandle("list-files")).toBe(false);
      expect(lsCommand.canHandle("list")).toBe(false);
    });
  });

  describe("execute", () => {
    it("should list tasks when tasks exist", async () => {
      const mockTasks: ITask[] = [
        {
          uuid: "11111111-1111-1111-1111-111111111111" as UUID,
          description: "Task 1",
          status: "todo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          uuid: "22222222-2222-2222-2222-222222222222" as UUID,
          description: "Task 2",
          status: "done",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const mockUseCase = new MockListTasksUseCase(mockTasks) as any;
      lsCommand = new LsCommand(mockUseCase, taskFormatter);

      const args: IParsedArgs = { command: "ls" };
      const result = await lsCommand.execute(args);

      expect(result).toContain("Task 1");
      expect(result).toContain("Task 2");
      expect(result).toContain("TODO");
      expect(result).toContain("DONE");
    });

    it("should return message when no tasks exist", async () => {
      const mockUseCase = new MockListTasksUseCase([]) as any;
      lsCommand = new LsCommand(mockUseCase, taskFormatter);

      const args: IParsedArgs = { command: "ls" };
      const result = await lsCommand.execute(args);

      expect(result).toBe("No tasks found.");
    });

    it("should filter tasks by status when status filter is provided", async () => {
      const mockTasks: ITask[] = [
        {
          uuid: "11111111-1111-1111-1111-111111111111" as UUID,
          description: "Todo task",
          status: "todo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          uuid: "22222222-2222-2222-2222-222222222222" as UUID,
          description: "Done task",
          status: "done",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const mockUseCase = new MockListTasksUseCase(mockTasks) as any;
      lsCommand = new LsCommand(mockUseCase, taskFormatter);

      const args: IParsedArgs = { command: "ls", statusFilter: "todo" };
      const result = await lsCommand.execute(args);

      expect(result).toContain("Todo task");
      expect(result).not.toContain("Done task");
    });
  });
});

