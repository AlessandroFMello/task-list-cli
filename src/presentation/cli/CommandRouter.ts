import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { CommandRegistry } from "../commands/CommandRegistry.js";
import { HelpCommand } from "../commands/HelpCommand.js";

/**
 * Routes parsed arguments to appropriate command handlers
 */
export class CommandRouter {
  constructor(
    private commandRegistry: CommandRegistry,
    private helpCommand: HelpCommand
  ) {}

  /**
   * Route command to appropriate handler
   * @param parsedArgs - Parsed command arguments
   * @returns Promise resolving to output string
   */
  async route(parsedArgs: IParsedArgs): Promise<string> {
    if (!parsedArgs.command) {
      return await this.helpCommand.execute(parsedArgs);
    }

    const command = this.commandRegistry.find(parsedArgs.command);

    if (!command) {
      return await this.helpCommand.execute(parsedArgs);
    }

    try {
      return await command.execute(parsedArgs);
    } catch (error) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return `Error: ${String(error)}`;
    }
  }
}


