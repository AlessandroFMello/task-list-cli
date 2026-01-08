import { ListFilesUseCase } from "../../use-cases/ListFilesUseCase.js";
import { IFileSystem } from "../../infrastructure/file-system/IFileSystem.js";
import { NodeFileSystem } from "../../infrastructure/file-system/NodeFileSystem.js";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";

describe("ListFilesUseCase", () => {
  let useCase: ListFilesUseCase;
  let fileSystem: IFileSystem;
  let testDir: string;

  beforeEach(() => {
    fileSystem = new NodeFileSystem();
    testDir = join(tmpdir(), `listfiles-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    useCase = new ListFilesUseCase(fileSystem, testDir);
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("should return empty array if directory doesn't exist", async () => {
    const nonExistentDir = join(testDir, "nonexistent");
    const useCase2 = new ListFilesUseCase(fileSystem, nonExistentDir);

    const files = await useCase2.execute();

    expect(files).toEqual([]);
  });

  it("should return empty array if no task files exist", async () => {
    const files = await useCase.execute();

    expect(files).toEqual([]);
  });

  it("should list task files", async () => {
    writeFileSync(join(testDir, "2024-01-01-tasks.json"), "[]");
    writeFileSync(join(testDir, "2024-01-02-tasks.json"), "[]");

    const files = await useCase.execute();

    expect(files).toHaveLength(2);
    expect(files[0].date).toBe("2024-01-01");
    expect(files[1].date).toBe("2024-01-02");
  });

  it("should filter only task files (YYYY-MM-DD-tasks.json)", async () => {
    writeFileSync(join(testDir, "2024-01-01-tasks.json"), "[]");
    writeFileSync(join(testDir, "other-file.json"), "[]");
    writeFileSync(join(testDir, "not-a-task-file.txt"), "content");

    const files = await useCase.execute();

    expect(files).toHaveLength(1);
    expect(files[0].date).toBe("2024-01-01");
  });

  it("should sort files by date ascending", async () => {
    writeFileSync(join(testDir, "2024-01-03-tasks.json"), "[]");
    writeFileSync(join(testDir, "2024-01-01-tasks.json"), "[]");
    writeFileSync(join(testDir, "2024-01-02-tasks.json"), "[]");

    const files = await useCase.execute();

    expect(files).toHaveLength(3);
    expect(files[0].date).toBe("2024-01-01");
    expect(files[1].date).toBe("2024-01-02");
    expect(files[2].date).toBe("2024-01-03");
  });

  it("should include file size and modified date", async () => {
    writeFileSync(join(testDir, "2024-01-01-tasks.json"), '[{"test": "data"}]');

    const files = await useCase.execute();

    expect(files).toHaveLength(1);
    expect(files[0].size).toBeGreaterThan(0);
    expect(files[0].modified).toBeDefined();
    expect(typeof files[0].modified.getTime).toBe("function");
  });
});

