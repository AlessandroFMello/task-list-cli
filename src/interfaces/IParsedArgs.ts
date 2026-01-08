import { UUID } from "node:crypto";
import { Command } from "../types/Command.js";
import { TaskStatus } from "../types/TaskStatus.js";

export interface IParsedArgs {
  command: Command | null;      // The main command (or null if invalid/missing)
  uuid?: UUID;                  // Task UUID (for update, delete, mark commands)
  description?: string;         // Task description (for add, update commands)
  statusFilter?: TaskStatus;    // Status filter (for list command)
  date?: string;                // Date for set-file-date command (YYYY-MM-DD format)
}