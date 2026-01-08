import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";

/**
 * Interface for command handlers
 */
export interface ICommand {
  /**
   * Check if this command can handle the given command
   */
  canHandle(command: Command): boolean;

  /**
   * Execute the command
   * @param args - Parsed command arguments
   * @returns Promise resolving to output string
   */
  execute(args: IParsedArgs): Promise<string>;
}


