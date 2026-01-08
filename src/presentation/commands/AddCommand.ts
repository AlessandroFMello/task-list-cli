import { ICommand } from "./ICommand.js";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { AddTaskUseCase } from "../../use-cases/AddTaskUseCase.js";

export class AddCommand implements ICommand {
  constructor(private addTaskUseCase: AddTaskUseCase) {}

  canHandle(command: Command): boolean {
    return command === "add";
  }

  async execute(args: IParsedArgs): Promise<string> {
    if (!args.description) {
      throw new Error("Description is required for add command");
    }

    const task = await this.addTaskUseCase.execute(args.description);
    return `Task added successfully (UUID: ${task.uuid})`;
  }
}


