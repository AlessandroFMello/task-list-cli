import path from "path"

export const TASKS_FILE_NAME = 'tasks.json'
export const TASKS_FILE_PATH = path.join(__dirname, TASKS_FILE_NAME)
export const VALID_STATUSES = ['in-progress', 'done']