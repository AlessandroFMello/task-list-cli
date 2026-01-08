/**
 * File statistics returned by IFileSystem.getStats()
 */
export interface FileStats {
  size: number;
  modified: Date;
  isFile: boolean;
  isDirectory: boolean;
}

