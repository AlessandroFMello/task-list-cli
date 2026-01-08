import { ICommand } from "./ICommand.js";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { UpdateTaskStatusUseCase } from "../../use-cases/UpdateTaskStatusUseCase.js";

export class MarkInProgressCommand implements ICommand {
  constructor(private updateTaskStatusUseCase: UpdateTaskStatusUseCase) {}

  canHandle(command: Command): boolean {
    return command === "mark-in-progress";
  }

  async execute(args: IParsedArgs): Promise<string> {
    if (!args.uuid) {
      throw new Error("UUID is required for mark-in-progress command");
    }

    await this.updateTaskStatusUseCase.execute(args.uuid, "in-progress");
    return `Task marked as in progress`;
  }
}


