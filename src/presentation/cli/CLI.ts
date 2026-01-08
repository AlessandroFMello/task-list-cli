import { ArgumentParser } from "./ArgumentParser.js";
import { CommandRouter } from "./CommandRouter.js";

/**
 * Refactored CLI - Thin orchestrator
 * Delegates to ArgumentParser and CommandRouter
 */
export class CLI {
  constructor(
    private argumentParser: ArgumentParser,
    private commandRouter: CommandRouter
  ) {}

  /**
   * Parse command-line arguments
   */
  parseArguments(args: string[]) {
    return this.argumentParser.parse(args);
  }

  /**
   * Route command to appropriate handler
   */
  async routeCommand(parsedArgs: any): Promise<string> {
    return await this.commandRouter.route(parsedArgs);
  }
}


