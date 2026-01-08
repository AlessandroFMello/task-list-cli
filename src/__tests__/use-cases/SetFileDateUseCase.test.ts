import { SetFileDateUseCase } from "../../use-cases/SetFileDateUseCase.js";
import { StateManager } from "../../infrastructure/state/StateManager.js";
import { IFileSystem } from "../../infrastructure/file-system/IFileSystem.js";
import { FileSystemError } from "../../infrastructure/errors/FileSystemError.js";
import { NodeFileSystem } from "../../infrastructure/file-system/NodeFileSystem.js";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";

describe("SetFileDateUseCase", () => {
  let useCase: SetFileDateUseCase;
  let fileSystem: IFileSystem;
  let stateManager: StateManager;
  let testDir: string;

  beforeEach(() => {
    fileSystem = new NodeFileSystem();
    testDir = join(tmpdir(), `setfiledate-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    stateManager = new StateManager(fileSystem, testDir);
    useCase = new SetFileDateUseCase(stateManager, fileSystem, testDir);
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("should set file date and save to state", async () => {
    const dateString = "2024-01-15";
    const fileName = `${dateString}-tasks.json`;
    const filePath = join(testDir, fileName);
    writeFileSync(filePath, "[]");

    const result = await useCase.execute(dateString);

    expect(result).toBe(filePath);
    const savedPath = await stateManager.getCurrentFilePath();
    expect(savedPath).toBe(filePath);
  });

  it("should throw error if date format is invalid", async () => {
    await expect(useCase.execute("invalid")).rejects.toThrow(
      "Invalid date format"
    );
    await expect(useCase.execute("2024/01/15")).rejects.toThrow();
    await expect(useCase.execute("01-15-2024")).rejects.toThrow();
  });

  it("should throw error if date is invalid", async () => {
    await expect(useCase.execute("2024-13-01")).rejects.toThrow(
      "Invalid date"
    );
    await expect(useCase.execute("2024-02-30")).rejects.toThrow();
  });

  it("should throw FileSystemError if file doesn't exist", async () => {
    await expect(useCase.execute("2024-12-31")).rejects.toThrow(
      FileSystemError
    );
    try {
      await useCase.execute("2024-12-31");
      fail("Should have thrown");
    } catch (error) {
      if (error instanceof FileSystemError) {
        expect(error.code).toBe("ENOENT");
      }
    }
  });
});

