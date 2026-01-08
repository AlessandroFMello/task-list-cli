import { UUID, randomUUID } from "node:crypto";
import { TaskStatus } from "../types/TaskStatus.js";
import { ITask } from "../interfaces/ITask.js";


export class Task {
    private _uuid: UUID;
    private _status: TaskStatus;
    private _description: string;
    private _createdAt: string;
    private _updatedAt: string;

    private constructor(description: string) {
        this._uuid = randomUUID();
        this._status = "todo";
        this._description = description;
        this._createdAt = new Date().toISOString();
        this._updatedAt = new Date().toISOString();
    }

    public static create(description: string): ITask {
        return new Task(description).toJSON();
    }

    get uuid(): UUID {
        return this._uuid;
    }

    get status(): TaskStatus {
        return this._status;
    }

    get description(): string {
        return this._description;
    }

    get createdAt(): string {
        return this._createdAt;
    }

    get updatedAt(): string {
        return this._updatedAt;
    }

    toJSON(): ITask {
        return {
            uuid: this._uuid,
            status: this._status,
            description: this._description,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt
        };
    }
}