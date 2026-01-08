import { UpdateTaskStatusUseCase } from "../../use-cases/UpdateTaskStatusUseCase.js";
import { MockTaskRepository } from "../helpers/mocks/MockTaskRepository.js";
import { TaskNotFoundError } from "../../domain/errors/TaskNotFoundError.js";
import { InvalidTaskError } from "../../domain/errors/InvalidTaskError.js";
import { UUID } from "node:crypto";
import { Task } from "../../domain/entities/Task.js";

describe("UpdateTaskStatusUseCase", () => {
  let useCase: UpdateTaskStatusUseCase;
  let repository: MockTaskRepository;

  beforeEach(() => {
    repository = new MockTaskRepository();
    useCase = new UpdateTaskStatusUseCase(repository);
  });

  it("should update task status", async () => {
    const task = Task.create("Test task");
    await repository.save(task);

    const updated = await useCase.execute(task.uuid!, "in_progress");

    expect(updated.status).toBe("in_progress");
  });

  it("should normalize CLI format status", async () => {
    const task = Task.create("Test task");
    await repository.save(task);

    const updated = await useCase.execute(task.uuid!, "in-progress");

    expect(updated.status).toBe("in_progress");
  });

  it("should update updatedAt timestamp", async () => {
    const task = Task.create("Test task");
    await repository.save(task);
    const originalUpdatedAt = task.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 10));

    const updated = await useCase.execute(task.uuid!, "done");

    expect(updated.updatedAt).not.toBe(originalUpdatedAt);
  });

  it("should throw TaskNotFoundError if task doesn't exist", async () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;

    await expect(useCase.execute(uuid, "done")).rejects.toThrow(
      TaskNotFoundError
    );
  });

  it("should throw InvalidTaskError for invalid status", async () => {
    const task = Task.create("Test task");
    await repository.save(task);

    await expect(useCase.execute(task.uuid!, "invalid")).rejects.toThrow(
      InvalidTaskError
    );
  });

  it("should accept all valid statuses", async () => {
    const task = Task.create("Test task");
    await repository.save(task);

    const statuses = ["todo", "in_progress", "done"];

    for (const status of statuses) {
      const updated = await useCase.execute(task.uuid!, status);
      expect(updated.status).toBe(status);
    }
  });
});

