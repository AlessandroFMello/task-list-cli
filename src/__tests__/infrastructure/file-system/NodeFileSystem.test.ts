import { NodeFileSystem } from "../../../infrastructure/file-system/NodeFileSystem.js";
import { FileSystemError } from "../../../infrastructure/errors/FileSystemError.js";
import { existsSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("NodeFileSystem", () => {
  let fileSystem: NodeFileSystem;
  let testDir: string;

  beforeEach(() => {
    fileSystem = new NodeFileSystem();
    testDir = join(tmpdir(), `task-tracker-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("exists", () => {
    it("should return true for existing file", async () => {
      const filePath = join(testDir, "test.txt");
      writeFileSync(filePath, "test content");

      const exists = await fileSystem.exists(filePath);
      expect(exists).toBe(true);
    });

    it("should return false for non-existing file", async () => {
      const filePath = join(testDir, "nonexistent.txt");
      const exists = await fileSystem.exists(filePath);
      expect(exists).toBe(false);
    });
  });

  describe("readFile", () => {
    it("should read file contents", async () => {
      const filePath = join(testDir, "test.txt");
      const content = "test content";
      writeFileSync(filePath, content);

      const result = await fileSystem.readFile(filePath);
      expect(result).toBe(content);
    });

    it("should read file with custom encoding", async () => {
      const filePath = join(testDir, "test.txt");
      writeFileSync(filePath, "test content", "utf-8");

      const result = await fileSystem.readFile(filePath, "utf-8");
      expect(result).toBe("test content");
    });

    it("should throw FileSystemError for non-existing file", async () => {
      const filePath = join(testDir, "nonexistent.txt");

      await expect(fileSystem.readFile(filePath)).rejects.toThrow(
        FileSystemError
      );
      try {
        await fileSystem.readFile(filePath);
        fail("Should have thrown");
      } catch (error) {
        if (error instanceof FileSystemError) {
          expect(error.code).toBe("ENOENT");
        }
      }
    });
  });

  describe("writeFile", () => {
    it("should write file contents", async () => {
      const filePath = join(testDir, "test.txt");
      const content = "test content";

      await fileSystem.writeFile(filePath, content);

      const written = existsSync(filePath);
      expect(written).toBe(true);
    });

    it("should overwrite existing file", async () => {
      const filePath = join(testDir, "test.txt");
      writeFileSync(filePath, "old content");

      await fileSystem.writeFile(filePath, "new content");

      const result = await fileSystem.readFile(filePath);
      expect(result).toBe("new content");
    });
  });

  describe("ensureDirectory", () => {
    it("should create directory if it doesn't exist", async () => {
      const dirPath = join(testDir, "new-dir");

      await fileSystem.ensureDirectory(dirPath);

      expect(existsSync(dirPath)).toBe(true);
    });

    it("should not throw if directory already exists", async () => {
      const dirPath = join(testDir, "existing-dir");
      mkdirSync(dirPath);

      await expect(fileSystem.ensureDirectory(dirPath)).resolves.not.toThrow();
    });

    it("should create nested directories", async () => {
      const dirPath = join(testDir, "nested", "deep", "directory");

      await fileSystem.ensureDirectory(dirPath);

      expect(existsSync(dirPath)).toBe(true);
    });
  });

  describe("readDirectory", () => {
    it("should read directory contents", async () => {
      writeFileSync(join(testDir, "file1.txt"), "content1");
      writeFileSync(join(testDir, "file2.txt"), "content2");
      mkdirSync(join(testDir, "subdir"));

      const files = await fileSystem.readDirectory(testDir);

      expect(files).toContain("file1.txt");
      expect(files).toContain("file2.txt");
      expect(files).toContain("subdir");
    });

    it("should throw FileSystemError for non-existing directory", async () => {
      const dirPath = join(testDir, "nonexistent");

      await expect(fileSystem.readDirectory(dirPath)).rejects.toThrow(
        FileSystemError
      );
    });
  });

  describe("getStats", () => {
    it("should return file statistics", async () => {
      const filePath = join(testDir, "test.txt");
      writeFileSync(filePath, "test content");

      const stats = await fileSystem.getStats(filePath);

      expect(stats.isFile).toBe(true);
      expect(stats.isDirectory).toBe(false);
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.modified).toBeDefined();
      expect(stats.modified.getTime).toBeDefined(); // Check if it's a Date-like object
    });

    it("should return directory statistics", async () => {
      const stats = await fileSystem.getStats(testDir);

      expect(stats.isFile).toBe(false);
      expect(stats.isDirectory).toBe(true);
    });

    it("should throw FileSystemError for non-existing path", async () => {
      const filePath = join(testDir, "nonexistent.txt");

      await expect(fileSystem.getStats(filePath)).rejects.toThrow(
        FileSystemError
      );
    });
  });
});

