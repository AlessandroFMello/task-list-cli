import { ICommand } from "./ICommand.js";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { ListTasksUseCase } from "../../use-cases/ListTasksUseCase.js";
import { TaskFormatter } from "../formatters/TaskFormatter.js";

export class ListCommand implements ICommand {
  constructor(
    private listTasksUseCase: ListTasksUseCase,
    private taskFormatter: TaskFormatter
  ) {}

  canHandle(command: Command): boolean {
    return command === "list";
  }

  async execute(args: IParsedArgs): Promise<string> {
    const statusFilter = args.statusFilter
      ? args.statusFilter
      : undefined;
    const tasks = await this.listTasksUseCase.execute(statusFilter);
    return this.taskFormatter.formatList(tasks);
  }
}


