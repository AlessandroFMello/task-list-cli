import { ICommand } from "./ICommand.js";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import path from "node:path";
import { StateManager } from "../../infrastructure/state/StateManager.js";
import { getTasksFilePath } from "../../helpers/getTasksFilePath.js";

export class CurrentFileCommand implements ICommand {
  constructor(
    private stateManager: StateManager,
    private tasksDirectory: string
  ) {}

  canHandle(command: Command): boolean {
    return command === "current-file";
  }

  async execute(args: IParsedArgs): Promise<string> {
    const currentPath = await this.stateManager.getCurrentFilePath();
    const defaultPath = getTasksFilePath();

    const filePath = currentPath || defaultPath;
    const fileName = path.basename(filePath);
    const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})-tasks\.json$/);

    if (dateMatch) {
      return `Current task file: ${dateMatch[1]}`;
    }

    return `Current task file: ${fileName}`;
  }
}


