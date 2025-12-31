import path from "path"
import { getDate } from "./getDate.js";

export const VALID_STATUSES: Array<'todo' | 'in-progress' | 'completed'> = ['todo', 'in-progress', 'completed']

export const getTasksFilePath = (): string => {
    const date = getDate();

    return path.join(process.cwd(), `src/tasks/${date}-tasks.json`);
};

