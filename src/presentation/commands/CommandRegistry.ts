import { Command } from "../../types/Command.js";
import { ICommand } from "./ICommand.js";

/**
 * Registry for command handlers
 */
export class CommandRegistry {
  private commands: ICommand[] = [];

  /**
   * Register a command handler
   */
  register(command: ICommand): void {
    this.commands.push(command);
  }

  /**
   * Find command handler for given command
   * @returns Command handler or null if not found
   */
  find(command: Command): ICommand | null {
    return this.commands.find((cmd) => cmd.canHandle(command)) || null;
  }
}


