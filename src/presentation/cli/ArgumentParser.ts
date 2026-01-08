import { UUID } from "node:crypto";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { TaskStatus } from "../../domain/value-objects/TaskStatus.js";

/**
 * Parses command-line arguments into structured IParsedArgs
 */
export class ArgumentParser {
  /**
   * Parse command-line arguments
   * @param args - Array of command-line arguments (typically process.argv)
   * @returns Parsed arguments object
   */
  parse(args: string[]): IParsedArgs {
    // Skip node executable and script path
    const commandArgs = args.slice(2);

    if (commandArgs.length === 0) {
      return { command: null };
    }

    const command = commandArgs[0] as Command;
    const validCommands: Command[] = [
      "set-file-date",
      "add",
      "update",
      "delete",
      "mark-in-progress",
      "mark-done",
      "list",
      "list-files",
      "current-file",
      "clear",
    ];

    if (!validCommands.includes(command)) {
      return { command: null };
    }

    const parsed: IParsedArgs = { command };

    switch (command) {
      case "set-file-date":
        if (commandArgs.length < 2) {
          throw new Error("Missing required argument: date (YYYY-MM-DD)");
        }
        parsed.date = commandArgs[1];
        break;

      case "add":
        if (commandArgs.length < 2) {
          throw new Error("Missing required argument: description");
        }
        parsed.description = commandArgs[1];
        break;

      case "update":
        if (commandArgs.length < 3) {
          throw new Error("Missing required arguments: UUID and description");
        }
        parsed.uuid = commandArgs[1] as UUID;
        parsed.description = commandArgs[2];
        break;

      case "delete":
      case "mark-in-progress":
      case "mark-done":
        if (commandArgs.length < 2) {
          throw new Error(`Missing required argument: UUID`);
        }
        parsed.uuid = commandArgs[1] as UUID;
        break;
      
      case "list":
        if (commandArgs.length >= 2) {
          const statusArg = commandArgs[1];
          // Normalize CLI format to internal format
          try {
            parsed.statusFilter = TaskStatus.fromString(statusArg);
          } catch (error) {
            throw new Error(
              `Invalid status filter: ${statusArg}. Valid values: todo, in-progress, done`
            );
          }
        }
        break;

      case "list-files":
      case "current-file":
      case "clear":
        // No arguments needed
        break;

      default:
        break;
    }

    return parsed;
  }
}


