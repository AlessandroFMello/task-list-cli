import { ICommand } from "./ICommand.js";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { ListFilesUseCase } from "../../use-cases/ListFilesUseCase.js";
import { DateFormatter } from "../formatters/DateFormatter.js";

export class ListFilesCommand implements ICommand {
  constructor(
    private listFilesUseCase: ListFilesUseCase,
    private dateFormatter: DateFormatter
  ) {}

  canHandle(command: Command): boolean {
    return command === "list-files";
  }

  async execute(args: IParsedArgs): Promise<string> {
    const files = await this.listFilesUseCase.execute();

    if (files.length === 0) {
      return "No task files found.";
    }

    const fileList = files
      .map((file, index) => {
        const modifiedDate = this.dateFormatter.formatFileDate(file.modified);
        return `${index + 1}. ${file.date} (${file.size} bytes, modified: ${modifiedDate})`;
      })
      .join("\n");

    return `Available task files:\n${fileList}`;
  }
}


