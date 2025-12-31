import { Command } from "../types/Command";
import { TaskStatus } from "../types/TaskStatus";

export interface IParsedArgs {
  command: Command | null;      // The main command (or null if invalid/missing)
  id?: number;                  // Task ID (for update, delete, mark commands)
  description?: string;         // Task description (for add, update commands)
  statusFilter?: TaskStatus;    // Status filter (for list command)
}