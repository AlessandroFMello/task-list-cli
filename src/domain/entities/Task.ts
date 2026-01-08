import { UUID, randomUUID } from "node:crypto";
import { TaskStatus, TaskStatusType } from "../value-objects/TaskStatus.js";
import { InvalidTaskError } from "../errors/InvalidTaskError.js";
import { ITask } from "../../interfaces/ITask.js";

/**
 * Task entity representing a task in the domain
 */
export class Task {
  private _uuid: UUID;
  private _status: TaskStatusType;
  private _description: string;
  private _createdAt: string;
  private _updatedAt: string;

  private constructor(description: string) {
    this.validateDescription(description);
    
    this._uuid = randomUUID();
    this._status = "todo";
    this._description = description.trim();
    this._createdAt = new Date().toISOString();
    this._updatedAt = new Date().toISOString();
  }

  /**
   * Create a new Task
   * @param description - Task description
   * @returns ITask object
   * @throws InvalidTaskError if description is invalid
   */
  public static create(description: string): ITask {
    return new Task(description).toJSON();
  }

  /**
   * Create Task from existing data (for repository)
   * @param data - Existing task data
   * @returns Task instance
   */
  public static fromData(data: ITask): Task {
    const task = new Task(data.description);
    if (data.uuid) task._uuid = data.uuid;
    if (data.status) task._status = data.status as TaskStatusType;
    if (data.createdAt) task._createdAt = data.createdAt;
    if (data.updatedAt) task._updatedAt = data.updatedAt;
    return task;
  }

  /**
   * Validate task description
   * @throws InvalidTaskError if description is invalid
   */
  private validateDescription(description: string): void {
    if (!description || typeof description !== "string") {
      throw new InvalidTaskError("Description is required");
    }

    const trimmed = description.trim();
    
    if (trimmed.length === 0) {
      throw new InvalidTaskError("Description cannot be empty");
    }

    if (trimmed.length > 500) {
      throw new InvalidTaskError(
        "Description cannot exceed 500 characters"
      );
    }
  }

  /**
   * Update task description
   * @param description - New description
   * @throws InvalidTaskError if description is invalid
   */
  public updateDescription(description: string): void {
    this.validateDescription(description);
    this._description = description.trim();
    this._updatedAt = new Date().toISOString();
  }

  /**
   * Update task status
   * @param status - New status
   * @throws InvalidTaskError if status is invalid
   */
  public updateStatus(status: string): void {
    this._status = TaskStatus.fromString(status);
    this._updatedAt = new Date().toISOString();
  }

  get uuid(): UUID {
    return this._uuid;
  }

  get status(): TaskStatusType {
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

  /**
   * Convert Task to ITask JSON format
   */
  toJSON(): ITask {
    return {
      uuid: this._uuid,
      status: this._status,
      description: this._description,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

