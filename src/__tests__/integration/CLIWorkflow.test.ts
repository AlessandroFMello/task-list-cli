import { CLIFactory } from "../../presentation/cli/CLIFactory.js";
import { CLI } from "../../presentation/cli/CLI.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { UUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, unlinkSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

/**
 * Get test tasks directory
 */
function getTestTasksDirectory(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, "../../..");
  return path.join(projectRoot, "src/tasks");
}

/**
 * Clean up test files
 */
function cleanupTestFiles(): void {
  const tasksDir = getTestTasksDirectory();
  if (existsSync(tasksDir)) {
    const files = readdirSync(tasksDir);
    files.forEach((file: string) => {
      if (file.endsWith("-tasks.json") || file === ".current-task-file") {
        try {
          unlinkSync(path.join(tasksDir, file));
        } catch (error) {
          // Ignore errors
        }
      }
    });
  }
}

describe("CLI Integration Tests - Complete Workflows", () => {
  let cli: CLI;
  const testDate = "2024-01-15";
  const testTasksDir = getTestTasksDirectory();

  beforeEach(() => {
    cleanupTestFiles();
    cli = CLIFactory.create();
    // Ensure test directory exists
    if (!existsSync(testTasksDir)) {
      mkdirSync(testTasksDir, { recursive: true });
    }
  });

  afterEach(() => {
    cleanupTestFiles();
  });

  describe("Add and List Workflow", () => {
    it("should add a task and list it", async () => {
      // Create a new CLI instance for each operation to ensure fresh state
      const cli1 = CLIFactory.create();
      
      // Add task
      const addArgs: IParsedArgs = {
        command: "add",
        description: "Test task for integration",
      };
      const addResult = await cli1.routeCommand(addArgs);
      expect(addResult).toContain("Task added successfully");
      expect(addResult).toContain("UUID:");

      // Extract UUID from result
      const uuidMatch = addResult.match(/UUID: ([a-f0-9-]+)/i);
      expect(uuidMatch).toBeTruthy();
      const taskUuid = uuidMatch![1] as UUID;

      // Create new CLI instance to read the saved task
      const cli2 = CLIFactory.create();
      // List all tasks
      const listArgs: IParsedArgs = { command: "list" };
      const listResult = await cli2.routeCommand(listArgs);
      expect(listResult).toContain("Test task for integration");
      expect(listResult).toContain(taskUuid);
    });
  });

  describe("Add, Update, and List Workflow", () => {
    it("should add, update, and list a task", async () => {
      // Add task
      const addArgs: IParsedArgs = {
        command: "add",
        description: "Original description",
      };
      const addResult = await cli.routeCommand(addArgs);
      const uuidMatch = addResult.match(/UUID: ([a-f0-9-]+)/i);
      const taskUuid = uuidMatch![1] as UUID;

      // Update task
      const updateArgs: IParsedArgs = {
        command: "update",
        uuid: taskUuid,
        description: "Updated description",
      };
      const updateResult = await cli.routeCommand(updateArgs);
      expect(updateResult).toContain("Task updated successfully");

      // List and verify
      const listArgs: IParsedArgs = { command: "list" };
      const listResult = await cli.routeCommand(listArgs);
      expect(listResult).toContain("Updated description");
      expect(listResult).not.toContain("Original description");
    });
  });

  describe("Add, Mark Status, and List Workflow", () => {
    it("should add, mark in-progress, mark done, and filter by status", async () => {
      // Add task
      const addArgs: IParsedArgs = {
        command: "add",
        description: "Task to test status",
      };
      const addResult = await cli.routeCommand(addArgs);
      const uuidMatch = addResult.match(/UUID: ([a-f0-9-]+)/i);
      const taskUuid = uuidMatch![1] as UUID;

      // Mark in-progress
      const markInProgressArgs: IParsedArgs = {
        command: "mark-in-progress",
        uuid: taskUuid,
      };
      await cli.routeCommand(markInProgressArgs);

      // List in-progress tasks
      const listInProgressArgs: IParsedArgs = {
        command: "list",
        statusFilter: "in_progress",
      };
      const inProgressResult = await cli.routeCommand(listInProgressArgs);
      expect(inProgressResult).toContain("Task to test status");

      // Mark done
      const markDoneArgs: IParsedArgs = {
        command: "mark-done",
        uuid: taskUuid,
      };
      await cli.routeCommand(markDoneArgs);

      // List done tasks
      const listDoneArgs: IParsedArgs = {
        command: "list",
        statusFilter: "done",
      };
      const doneResult = await cli.routeCommand(listDoneArgs);
      expect(doneResult).toContain("Task to test status");
    });
  });

  describe("Add and Delete Workflow", () => {
    it("should add and delete a task", async () => {
      // Add task
      const addArgs: IParsedArgs = {
        command: "add",
        description: "Task to delete",
      };
      const addResult = await cli.routeCommand(addArgs);
      const uuidMatch = addResult.match(/UUID: ([a-f0-9-]+)/i);
      const taskUuid = uuidMatch![1] as UUID;

      // Delete task
      const deleteArgs: IParsedArgs = {
        command: "delete",
        uuid: taskUuid,
      };
      const deleteResult = await cli.routeCommand(deleteArgs);
      expect(deleteResult).toContain("Task deleted successfully");

      // List and verify task is gone
      const listArgs: IParsedArgs = { command: "list" };
      const listResult = await cli.routeCommand(listArgs);
      expect(listResult).not.toContain("Task to delete");
      expect(listResult).toContain("No tasks found");
    });
  });

  describe("File Date Management Workflow", () => {
    it("should create task file, switch date, and list files", async () => {
      // Create a task file for a specific date
      const testFilePath = path.join(testTasksDir, `${testDate}-tasks.json`);
      writeFileSync(testFilePath, JSON.stringify([]), "utf-8");

      // Set file date
      const setDateArgs: IParsedArgs = {
        command: "set-file-date",
        date: testDate,
      };
      const setDateResult = await cli.routeCommand(setDateArgs);
      expect(setDateResult).toContain(`Switched to tasks file for date: ${testDate}`);

      // List files
      const listFilesArgs: IParsedArgs = { command: "list-files" };
      const listFilesResult = await cli.routeCommand(listFilesArgs);
      expect(listFilesResult).toContain(testDate);

      // Get current file
      const currentFileArgs: IParsedArgs = { command: "current-file" };
      const currentFileResult = await cli.routeCommand(currentFileArgs);
      expect(currentFileResult).toContain(testDate);
    });
  });
});

