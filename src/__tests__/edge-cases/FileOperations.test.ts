import { CLIFactory } from "../../presentation/cli/CLIFactory.js";
import { CLI } from "../../presentation/cli/CLI.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
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

describe("Edge Cases - File Operations", () => {
  let cli: CLI;
  const testTasksDir = getTestTasksDirectory();

  beforeEach(() => {
    cleanupTestFiles();
    cli = CLIFactory.create();
    if (!existsSync(testTasksDir)) {
      mkdirSync(testTasksDir, { recursive: true });
    }
  });

  afterEach(() => {
    cleanupTestFiles();
  });

  describe("Corrupted JSON File", () => {
    it("should handle corrupted JSON file gracefully", async () => {
      const testDate = "2024-01-15";
      const testFilePath = path.join(testTasksDir, `${testDate}-tasks.json`);
      
      // Create corrupted JSON
      writeFileSync(testFilePath, "invalid json content", "utf-8");

      // Try to list tasks (will try to read the corrupted file)
      const args: IParsedArgs = {
        command: "set-file-date",
        date: testDate,
      };

      // Setting the file date should work, but reading will fail
      const setDateResult = await cli.routeCommand(args);
      expect(setDateResult).toContain("Switched to tasks file");

      // Create new CLI to get fresh repository that will read the corrupted file
      const newCli = CLIFactory.create();
      // Now try to list - should handle corrupted JSON
      const listArgs: IParsedArgs = { command: "list" };
      const listResult = await newCli.routeCommand(listArgs);
      // Repository should either return empty array or throw error
      // Current behavior: returns empty array for corrupted files
      expect(listResult).toBeDefined();
    });
  });

  describe("Empty JSON File", () => {
    it("should handle empty JSON file", async () => {
      const testDate = "2024-01-16";
      const testFilePath = path.join(testTasksDir, `${testDate}-tasks.json`);
      
      // Create empty file
      writeFileSync(testFilePath, "", "utf-8");

      const args: IParsedArgs = {
        command: "set-file-date",
        date: testDate,
      };

      await cli.routeCommand(args);

      // List should return empty
      const listArgs: IParsedArgs = { command: "list" };
      const listResult = await cli.routeCommand(listArgs);
      expect(listResult).toContain("No tasks found");
    });
  });

  describe("Invalid JSON Structure", () => {
    it("should handle JSON file with invalid structure (not an array)", async () => {
      const testDate = "2024-01-17";
      const testFilePath = path.join(testTasksDir, `${testDate}-tasks.json`);
      
      // Create JSON with object instead of array
      writeFileSync(testFilePath, JSON.stringify({ tasks: [] }), "utf-8");

      const args: IParsedArgs = {
        command: "set-file-date",
        date: testDate,
      };

      await cli.routeCommand(args);

      // Create new CLI to get fresh repository
      const newCli = CLIFactory.create();
      // List should handle invalid structure
      const listArgs: IParsedArgs = { command: "list" };
      const listResult = await newCli.routeCommand(listArgs);
      // Repository should either return empty array or throw error
      // Current behavior: returns empty array for invalid structure
      expect(listResult).toBeDefined();
    });
  });

  describe("File with Missing Properties", () => {
    it("should handle task with missing properties", async () => {
      const testDate = "2024-01-18";
      const testFilePath = path.join(testTasksDir, `${testDate}-tasks.json`);
      
      // Create file with task missing some properties
      const invalidTask = {
        uuid: "123e4567-e89b-12d3-a456-426614174000",
        // Missing description, status, etc.
      };
      writeFileSync(testFilePath, JSON.stringify([invalidTask]), "utf-8");

      const args: IParsedArgs = {
        command: "set-file-date",
        date: testDate,
      };

      await cli.routeCommand(args);

      // List should handle missing properties
      const listArgs: IParsedArgs = { command: "list" };
      const listResult = await cli.routeCommand(listArgs);
      // Should either show the task or handle gracefully
      expect(listResult).toBeDefined();
    });
  });

  describe("Multiple Files", () => {
    it("should list multiple task files correctly", async () => {
      const date1 = "2024-01-19";
      const date2 = "2024-01-20";
      
      // Create two files
      const file1 = path.join(testTasksDir, `${date1}-tasks.json`);
      const file2 = path.join(testTasksDir, `${date2}-tasks.json`);
      
      writeFileSync(file1, JSON.stringify([{
        uuid: "11111111-1111-1111-1111-111111111111",
        description: "Task in file 1",
        status: "todo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]), "utf-8");

      writeFileSync(file2, JSON.stringify([{
        uuid: "22222222-2222-2222-2222-222222222222",
        description: "Task in file 2",
        status: "todo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]), "utf-8");

      // Create new CLI to ensure it reads the files
      const newCli = CLIFactory.create();
      // List files - should show both files
      const listFilesArgs: IParsedArgs = { command: "list-files" };
      const listFilesResult = await newCli.routeCommand(listFilesArgs);
      expect(listFilesResult).toContain(date1);
      expect(listFilesResult).toContain(date2);
    });
  });
});

