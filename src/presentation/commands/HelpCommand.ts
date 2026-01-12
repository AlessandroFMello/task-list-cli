import { ICommand } from "./ICommand.js";
import { Command } from "../../types/Command.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";

export class HelpCommand implements ICommand {
  canHandle(command: Command | null): boolean {
    return command === null;
  }

  async execute(args: IParsedArgs): Promise<string> {
    return `Task Tracker CLI - Usage

Commands:
  add "description"                    Add a new task
  update <uuid> "description"          Update a task's description
  delete <uuid>                        Delete a task
  mark-in-progress <uuid>              Mark a task as in progress
  mark-done <uuid>                     Mark a task as done
  list [status]                        List all tasks (optionally filter by status)
  ls [status]                          Alias for list (shorter command)
  list-files                           List all available task files
  current-file                         Show the date of the current task file
  clear                                Clear all tasks
  set-file-date "YYYY-MM-DD"           Select a file by date

Arguments:
  <uuid>                               UUID of the task
  "description"                        Description of the task

Status values for list:
  todo                                 Show only todo tasks
  in-progress                          Show only in-progress tasks
  done                                 Show only done tasks

Examples:
  task-cli add "Buy groceries"
  task-cli update c2a01015-c3c2-4605-930b-cdcaf5ff16ca "Buy groceries and cook dinner"
  task-cli delete c2a01015-c3c2-4605-930b-cdcaf5ff16ca
  task-cli mark-in-progress c2a01015-c3c2-4605-930b-cdcaf5ff16ca
  task-cli mark-done c2a01015-c3c2-4605-930b-cdcaf5ff16ca
  task-cli list
  task-cli ls
  task-cli list done
  task-cli ls in-progress
  task-cli list-files
  task-cli current-file
  task-cli clear
  task-cli set-file-date "2024-06-15"
`;
  }
}

