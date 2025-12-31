import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { ITask } from "./interfaces/ITask.js";
import { getTasksFilePath } from "./helpers/constants.js";

export class App {
  private tasksFilePath?: string;

  loadTasks = (): ITask[] => {
    if (!this.tasksFilePath) {
      this.tasksFilePath = getTasksFilePath();
    }

    if (!existsSync(this.tasksFilePath)) {
      writeFileSync(this.tasksFilePath, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    
    try {
      const fileContent = readFileSync(this.tasksFilePath, "utf-8");
      const tasks = JSON.parse(fileContent) as ITask[];
      
      if (!Array.isArray(tasks)) {
        throw new Error("Tasks file does not contain a valid array");
      }
      
      console.log("Deu bom pra caralho")
      return tasks;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Tasks file contains invalid JSON: ${error.message}`);
      }
      throw error;
    }
  }
}