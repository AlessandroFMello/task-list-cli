import { StateManager } from "../infrastructure/state/StateManager.js";
import { IFileSystem } from "../infrastructure/file-system/IFileSystem.js";
import { FileSystemError } from "../infrastructure/errors/FileSystemError.js";
import path from "node:path";
import { getDate } from "../helpers/getDate.js";

/**
 * Use case for setting the current task file by date
 */
export class SetFileDateUseCase {
  constructor(
    private stateManager: StateManager,
    private fileSystem: IFileSystem,
    private tasksDirectory: string
  ) {}

  /**
   * Execute the set file date use case
   * @param dateString - Date in YYYY-MM-DD format
   * @returns Promise resolving to the file path
   * @throws Error if date format is invalid or file doesn't exist
   */
  async execute(dateString: string): Promise<string> {
    // Validate date format (YYYY-MM-DD)
    this.validateDateFormat(dateString);

    // Construct file path
    const fileName = `${dateString}-tasks.json`;
    const filePath = path.join(this.tasksDirectory, fileName);

    // Check if file exists
    const exists = await this.fileSystem.exists(filePath);
    if (!exists) {
      throw new FileSystemError(
        `Tasks file for date ${dateString} does not exist. File: ${fileName}`,
        "ENOENT"
      );
    }

    // Save to state
    await this.stateManager.saveCurrentFilePath(filePath);

    return filePath;
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @throws Error if format is invalid
   */
  private validateDateFormat(dateString: string): void {
    const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateString.match(dateRegex);

    if (!match) {
      throw new Error(
        `Invalid date format: ${dateString}. Expected YYYY-MM-DD format (e.g., 2024-06-15)`
      );
    }

    const [, year, month, day] = match;

    // Validate date is actually valid
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    if (
      date.getFullYear() !== parseInt(year) ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getDate() !== parseInt(day)
    ) {
      throw new Error(
        `Invalid date: ${dateString}. Please provide a valid date.`
      );
    }
  }
}

