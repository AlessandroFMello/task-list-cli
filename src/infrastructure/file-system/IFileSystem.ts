import { FileStats } from "./types.js";

/**
 * Interface for file system operations
 * Abstracts file system access to enable testing and different implementations
 */
export interface IFileSystem {
  /**
   * Check if a file or directory exists
   * @param path - Path to check
   * @returns Promise resolving to true if exists, false otherwise
   */
  exists(path: string): Promise<boolean>;

  /**
   * Read file contents
   * @param path - File path
   * @param encoding - File encoding (default: 'utf-8')
   * @returns Promise resolving to file contents
   * @throws FileSystemError if file doesn't exist or can't be read
   */
  readFile(path: string, encoding?: string): Promise<string>;

  /**
   * Write file contents
   * @param path - File path
   * @param content - Content to write
   * @param encoding - File encoding (default: 'utf-8')
   * @returns Promise that resolves when file is written
   * @throws FileSystemError if file can't be written
   */
  writeFile(path: string, content: string, encoding?: string): Promise<void>;

  /**
   * Ensure directory exists, creating it if necessary
   * @param path - Directory path
   * @returns Promise that resolves when directory is ensured
   * @throws FileSystemError if directory can't be created
   */
  ensureDirectory(path: string): Promise<void>;

  /**
   * Read directory contents
   * @param path - Directory path
   * @returns Promise resolving to array of file/directory names
   * @throws FileSystemError if directory doesn't exist or can't be read
   */
  readDirectory(path: string): Promise<string[]>;

  /**
   * Get file statistics
   * @param path - File or directory path
   * @returns Promise resolving to file statistics
   * @throws FileSystemError if path doesn't exist
   */
  getStats(path: string): Promise<FileStats>;
}

