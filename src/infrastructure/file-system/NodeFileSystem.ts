import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { IFileSystem } from "./IFileSystem.js";
import { FileStats } from "./types.js";
import { FileSystemError } from "../errors/FileSystemError.js";

/**
 * Node.js file system implementation
 * Wraps synchronous fs operations in async/await for consistency
 */
export class NodeFileSystem implements IFileSystem {
  async exists(path: string): Promise<boolean> {
    try {
      return existsSync(path);
    } catch (error) {
      throw new FileSystemError(
        `Error checking if path exists: ${path}`,
        (error as any)?.code
      );
    }
  }

  async readFile(path: string, encoding: string = "utf-8"): Promise<string> {
    try {
      if (!existsSync(path)) {
        throw new FileSystemError(`File not found: ${path}`, "ENOENT");
      }
      return readFileSync(path, { encoding: encoding as BufferEncoding });
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      throw new FileSystemError(
        `Error reading file: ${path}. ${(error as Error).message}`,
        (error as any)?.code
      );
    }
  }

  async writeFile(
    path: string,
    content: string,
    encoding: string = "utf-8"
  ): Promise<void> {
    try {
      writeFileSync(path, content, { encoding: encoding as BufferEncoding });
    } catch (error) {
      const code = (error as any)?.code;
      if (code === "EACCES" || code === "EPERM") {
        throw new FileSystemError(
          `Permission denied: Cannot write to ${path}`,
          code
        );
      }
      if (code === "ENOSPC") {
        throw new FileSystemError(`Disk full: Cannot write to ${path}`, code);
      }
      throw new FileSystemError(
        `Error writing file: ${path}. ${(error as Error).message}`,
        code
      );
    }
  }

  async ensureDirectory(path: string): Promise<void> {
    try {
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }
    } catch (error) {
      throw new FileSystemError(
        `Error creating directory: ${path}. ${(error as Error).message}`,
        (error as any)?.code
      );
    }
  }

  async readDirectory(path: string): Promise<string[]> {
    try {
      if (!existsSync(path)) {
        throw new FileSystemError(`Directory not found: ${path}`, "ENOENT");
      }
      return readdirSync(path);
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      throw new FileSystemError(
        `Error reading directory: ${path}. ${(error as Error).message}`,
        (error as any)?.code
      );
    }
  }

  async getStats(path: string): Promise<FileStats> {
    try {
      if (!existsSync(path)) {
        throw new FileSystemError(`Path not found: ${path}`, "ENOENT");
      }
      const stats = statSync(path);
      return {
        size: stats.size,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      if (error instanceof FileSystemError) {
        throw error;
      }
      throw new FileSystemError(
        `Error getting stats for: ${path}. ${(error as Error).message}`,
        (error as any)?.code
      );
    }
  }
}

