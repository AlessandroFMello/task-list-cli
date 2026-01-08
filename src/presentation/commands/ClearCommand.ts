import { ICommand } from "./ICommand.js";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { ClearAllTasksUseCase } from "../../use-cases/ClearAllTasksUseCase.js";
import { IConfirmationService } from "../cli/IConfirmationService.js";

export class ClearCommand implements ICommand {
  constructor(
    private clearAllTasksUseCase: ClearAllTasksUseCase,
    private confirmationService: IConfirmationService
  ) {}

  canHandle(command: Command): boolean {
    return command === "clear";
  }

  async execute(args: IParsedArgs): Promise<string> {
    const confirmed = await this.confirmationService.ask(
      "Are you sure you want to clear all tasks? This action cannot be undone. (y/n): "
    );

    if (!confirmed) {
      throw new Error("Clear operation cancelled.");
    }

    await this.clearAllTasksUseCase.execute();
    return `All tasks cleared successfully`;
  }
}


