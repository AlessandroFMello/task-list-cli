import { StateManager } from "../../../infrastructure/state/StateManager.js";
import { IFileSystem } from "../../../infrastructure/file-system/IFileSystem.js";
import { FileSystemError } from "../../../infrastructure/errors/FileSystemError.js";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdirSync, rmSync, existsSync } from "node:fs";

// Mock IFileSystem for testing
class MockFileSystem implements IFileSystem {
  private files: Map<string, string> = new Map();
  private directories: Set<string> = new Set();

  async exists(path: string): Promise<boolean> {
    return this.files.has(path) || this.directories.has(path);
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (!content) {
      throw new FileSystemError(`File not found: ${path}`, "ENOENT");
    }
    return content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async ensureDirectory(path: string): Promise<void> {
    this.directories.add(path);
  }

  async readDirectory(path: string): Promise<string[]> {
    return [];
  }

  async getStats(path: string) {
    return {
      size: 0,
      modified: new Date(),
      isFile: this.files.has(path),
      isDirectory: this.directories.has(path),
    };
  }
}

describe("StateManager", () => {
  let stateManager: StateManager;
  let mockFileSystem: MockFileSystem;
  let testDir: string;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    testDir = join(tmpdir(), `state-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    stateManager = new StateManager(mockFileSystem, testDir);
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("getCurrentFilePath", () => {
    it("should return null if state file doesn't exist", async () => {
      const path = await stateManager.getCurrentFilePath();
      expect(path).toBeNull();
    });

    it("should return saved file path if it exists", async () => {
      const savedPath = join(testDir, "2024-01-01-tasks.json");
      await mockFileSystem.writeFile(
        join(testDir, ".current-task-file"),
        savedPath
      );
      await mockFileSystem.writeFile(savedPath, "[]"); // Make the file exist

      const path = await stateManager.getCurrentFilePath();
      expect(path).toBe(savedPath);
    });

    it("should return null if saved path doesn't exist", async () => {
      const savedPath = join(testDir, "nonexistent.json");
      await mockFileSystem.writeFile(
        join(testDir, ".current-task-file"),
        savedPath
      );

      const path = await stateManager.getCurrentFilePath();
      expect(path).toBeNull();
    });

    it("should return null if state file is empty", async () => {
      await mockFileSystem.writeFile(join(testDir, ".current-task-file"), "");

      const path = await stateManager.getCurrentFilePath();
      expect(path).toBeNull();
    });
  });

  describe("saveCurrentFilePath", () => {
    it("should save file path to state", async () => {
      const filePath = join(testDir, "2024-01-01-tasks.json");

      await stateManager.saveCurrentFilePath(filePath);

      const saved = await mockFileSystem.readFile(
        join(testDir, ".current-task-file")
      );
      expect(saved.trim()).toBe(filePath);
    });

    it("should ensure directory exists before saving", async () => {
      const filePath = join(testDir, "2024-01-01-tasks.json");

      await stateManager.saveCurrentFilePath(filePath);

      expect(await mockFileSystem.exists(testDir)).toBe(true);
    });

    it("should handle errors gracefully", async () => {
      // Create a file system that throws on write
      const errorFileSystem: IFileSystem = {
        exists: mockFileSystem.exists.bind(mockFileSystem),
        readFile: mockFileSystem.readFile.bind(mockFileSystem),
        writeFile: async () => {
          throw new FileSystemError("Write failed", "EACCES");
        },
        ensureDirectory: mockFileSystem.ensureDirectory.bind(mockFileSystem),
        readDirectory: mockFileSystem.readDirectory.bind(mockFileSystem),
        getStats: mockFileSystem.getStats.bind(mockFileSystem),
      };

      const errorStateManager = new StateManager(errorFileSystem, testDir);

      // Should not throw (errors are caught and ignored)
      await expect(
        errorStateManager.saveCurrentFilePath("test.json")
      ).resolves.not.toThrow();
    });
  });
});

