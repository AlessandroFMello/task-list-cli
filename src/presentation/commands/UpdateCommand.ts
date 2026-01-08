import { ICommand } from "./ICommand.js";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { UpdateTaskUseCase } from "../../use-cases/UpdateTaskUseCase.js";

export class UpdateCommand implements ICommand {
  constructor(private updateTaskUseCase: UpdateTaskUseCase) {}

  canHandle(command: Command): boolean {
    return command === "update";
  }

  async execute(args: IParsedArgs): Promise<string> {
    if (!args.uuid || !args.description) {
      throw new Error("UUID and description are required for update command");
    }

    await this.updateTaskUseCase.execute(args.uuid, args.description);
    return `Task updated successfully`;
  }
}


