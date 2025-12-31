import { TaskStatus } from "../types/TaskStatus"

export interface ITask {
    id: number,
    description: string,
    status: TaskStatus,
    createdAt: string,
    updatedAt: string
}