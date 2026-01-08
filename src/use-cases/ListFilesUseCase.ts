import { IFileSystem } from "../infrastructure/file-system/IFileSystem.js";
import { FileInfo } from "./types.js";

/**
 * Use case for listing all task files
 */
export class ListFilesUseCase {
  constructor(
    private fileSystem: IFileSystem,
    private tasksDirectory: string
  ) {}

  /**
   * Execute the list files use case
   * @returns Promise resolving to array of file information
   */
  async execute(): Promise<FileInfo[]> {
    // Check if directory exists
    const dirExists = await this.fileSystem.exists(this.tasksDirectory);
    if (!dirExists) {
      return [];
    }

    // Read directory
    const files = await this.fileSystem.readDirectory(this.tasksDirectory);

    // Filter task files (YYYY-MM-DD-tasks.json pattern)
    const taskFileRegex = /^(\d{4})-(\d{2})-(\d{2})-tasks\.json$/;
    const taskFiles = files.filter((file) => taskFileRegex.test(file));

    // Get file information
    const fileInfos: FileInfo[] = [];

    for (const file of taskFiles) {
      const filePath = `${this.tasksDirectory}/${file}`;
      const stats = await this.fileSystem.getStats(filePath);

      // Extract date from filename
      const match = file.match(taskFileRegex);
      if (match) {
        fileInfos.push({
          date: `${match[1]}-${match[2]}-${match[3]}`, // YYYY-MM-DD
          size: stats.size,
          modified: stats.modified,
        });
      }
    }

    // Sort by date (ascending)
    fileInfos.sort((a, b) => a.date.localeCompare(b.date));

    return fileInfos;
  }
}

