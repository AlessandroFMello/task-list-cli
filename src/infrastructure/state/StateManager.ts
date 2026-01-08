import path from "node:path";
import { IFileSystem } from "../file-system/IFileSystem.js";
import { FileSystemError } from "../errors/FileSystemError.js";

/**
 * Manages the current task file path state
 * Persists the selected task file path in a state file
 */
export class StateManager {
  private stateFilePath: string;

  constructor(
    private fileSystem: IFileSystem,
    private tasksDirectory: string
  ) {
    this.stateFilePath = path.join(this.tasksDirectory, ".current-task-file");
  }

  /**
   * Get the current task file path from state
   * @returns Promise resolving to file path or null if not set
   */
  async getCurrentFilePath(): Promise<string | null> {
    try {
      const exists = await this.fileSystem.exists(this.stateFilePath);
      if (!exists) {
        return null;
      }

      const content = await this.fileSystem.readFile(this.stateFilePath);
      const filePath = content.trim();

      // Verify the saved path still exists
      if (filePath && (await this.fileSystem.exists(filePath))) {
        return filePath;
      }

      return null;
    } catch (error) {
      // If we can't read the state file, return null (not critical)
      if (error instanceof FileSystemError) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Save the current task file path to state
   * @param filePath - Path to save
   * @returns Promise that resolves when state is saved
   */
  async saveCurrentFilePath(filePath: string): Promise<void> {
    try {
      await this.fileSystem.ensureDirectory(this.tasksDirectory);
      await this.fileSystem.writeFile(this.stateFilePath, filePath);
    } catch (error) {
      // Silently fail - not critical if we can't save state
      // But log for debugging if needed
      if (error instanceof FileSystemError) {
        // Could log here if we had a logger
        return;
      }
      throw error;
    }
  }
}

