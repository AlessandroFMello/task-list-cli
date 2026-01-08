import { ICommand } from "./ICommand.js";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { ListTasksUseCase } from "../../use-cases/ListTasksUseCase.js";
import { TaskFormatter } from "../formatters/TaskFormatter.js";

/**
 * LsCommand - Alias for list command
 * Provides a shorter command to list tasks
 */
export class LsCommand implements ICommand {
  constructor(
    private listTasksUseCase: ListTasksUseCase,
    private taskFormatter: TaskFormatter
  ) {}

  canHandle(command: Command): boolean {
    return command === "ls";
  }

  async execute(args: IParsedArgs): Promise<string> {
    const statusFilter = args.statusFilter
      ? args.statusFilter
      : undefined;
    const tasks = await this.listTasksUseCase.execute(statusFilter);
    return this.taskFormatter.formatList(tasks);
  }
}

