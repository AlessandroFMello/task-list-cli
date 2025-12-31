import { TaskStatus } from "../types/TaskStatus.js"

export interface ITask {
    id: number,
    description: string,
    status: TaskStatus,
    createdAt: string,
    updatedAt: string
}