import { ICommand } from "./ICommand.js";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { DeleteTaskUseCase } from "../../use-cases/DeleteTaskUseCase.js";

export class DeleteCommand implements ICommand {
  constructor(private deleteTaskUseCase: DeleteTaskUseCase) {}

  canHandle(command: Command): boolean {
    return command === "delete";
  }

  async execute(args: IParsedArgs): Promise<string> {
    if (!args.uuid) {
      throw new Error("UUID is required for delete command");
    }

    await this.deleteTaskUseCase.execute(args.uuid);
    return `Task deleted successfully`;
  }
}


