import { ICommand } from "./ICommand.js";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { UpdateTaskStatusUseCase } from "../../use-cases/UpdateTaskStatusUseCase.js";

export class MarkDoneCommand implements ICommand {
  constructor(private updateTaskStatusUseCase: UpdateTaskStatusUseCase) {}

  canHandle(command: Command): boolean {
    return command === "mark-done";
  }

  async execute(args: IParsedArgs): Promise<string> {
    if (!args.uuid) {
      throw new Error("UUID is required for mark-done command");
    }

    await this.updateTaskStatusUseCase.execute(args.uuid, "done");
    return `Task marked as done`;
  }
}


