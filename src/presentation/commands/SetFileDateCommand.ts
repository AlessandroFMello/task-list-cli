import { ICommand } from "./ICommand.js";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { SetFileDateUseCase } from "../../use-cases/SetFileDateUseCase.js";

export class SetFileDateCommand implements ICommand {
  constructor(private setFileDateUseCase: SetFileDateUseCase) {}

  canHandle(command: Command): boolean {
    return command === "set-file-date";
  }

  async execute(args: IParsedArgs): Promise<string> {
    if (!args.date) {
      throw new Error("Date is required for set-file-date command");
    }

    await this.setFileDateUseCase.execute(args.date);
    return `Switched to tasks file for date: ${args.date}`;
  }
}


