import { UUID } from "node:crypto";
import { TaskStatus } from "../types/TaskStatus.js";

export interface ITask {
    uuid?: UUID,
    description: string,
    status?: TaskStatus,
    createdAt?: string,
    updatedAt?: string
}