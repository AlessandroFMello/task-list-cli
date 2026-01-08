import { ITask } from "../../interfaces/ITask.js";
import { IDateFormatter } from "./IDateFormatter.js";

/**
 * Formatter for task display
 */
export class TaskFormatter {
  constructor(private dateFormatter: IDateFormatter) {}

  /**
   * Format a single task for display
   */
  format(task: ITask): string {
    const statusDisplay = task.status?.toUpperCase() || "N/A";

    return `UUID: ${task.uuid || "N/A"}
Description: ${task.description}
Status: ${statusDisplay}
Created: ${this.dateFormatter.format(task.createdAt)}
Updated: ${this.dateFormatter.format(task.updatedAt)}
---`;
  }

  /**
   * Format a list of tasks for display
   */
  formatList(tasks: ITask[]): string {
    if (tasks.length === 0) {
      return "No tasks found.";
    }
    return tasks.map((task) => this.format(task)).join("\n\n");
  }
}


