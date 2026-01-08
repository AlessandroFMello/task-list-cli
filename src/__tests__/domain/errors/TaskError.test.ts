import { TaskError } from "../../../domain/errors/TaskError.js";
import { TaskNotFoundError } from "../../../domain/errors/TaskNotFoundError.js";
import { InvalidTaskError } from "../../../domain/errors/InvalidTaskError.js";
import { FileSystemError } from "../../../infrastructure/errors/FileSystemError.js";

describe("TaskError", () => {
  it("should be an instance of Error", () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000" as const;
    const error = new TaskNotFoundError(uuid);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(TaskError);
  });

  it("should have correct name", () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000" as const;
    const error = new TaskNotFoundError(uuid);
    expect(error.name).toBe("TaskNotFoundError");
  });
});

describe("TaskNotFoundError", () => {
  it("should create error with correct message", () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000";
    const error = new TaskNotFoundError(uuid);
    expect(error.message).toBe(`Task with UUID ${uuid} not found`);
  });
});

describe("InvalidTaskError", () => {
  it("should create error with correct message", () => {
    const message = "Description cannot be empty";
    const error = new InvalidTaskError(message);
    expect(error.message).toBe(`Invalid task: ${message}`);
  });
});

describe("FileSystemError", () => {
  it("should create error with message and code", () => {
    const error = new FileSystemError("Permission denied", "EACCES");
    expect(error.message).toBe("Permission denied");
    expect(error.code).toBe("EACCES");
  });

  it("should create error without code", () => {
    const error = new FileSystemError("File not found");
    expect(error.message).toBe("File not found");
    expect(error.code).toBeUndefined();
  });
});

