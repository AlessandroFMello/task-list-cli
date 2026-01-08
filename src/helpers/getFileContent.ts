import { readFileSync, existsSync } from "node:fs";

export function getFileContent(tasksFilePath: string): string {
    if (!existsSync(tasksFilePath)) {
        throw new Error(`File does not exist: ${tasksFilePath}`);
    }
    const fileContent = readFileSync(tasksFilePath, "utf-8");
    return fileContent;
}