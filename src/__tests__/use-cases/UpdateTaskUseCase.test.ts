import { UpdateTaskUseCase } from "../../use-cases/UpdateTaskUseCase.js";
import { MockTaskRepository } from "../helpers/mocks/MockTaskRepository.js";
import { TaskNotFoundError } from "../../domain/errors/TaskNotFoundError.js";
import { InvalidTaskError } from "../../domain/errors/InvalidTaskError.js";
import { UUID } from "node:crypto";
import { Task } from "../../domain/entities/Task.js";

describe("UpdateTaskUseCase", () => {
  let useCase: UpdateTaskUseCase;
  let repository: MockTaskRepository;

  beforeEach(() => {
    repository = new MockTaskRepository();
    useCase = new UpdateTaskUseCase(repository);
  });

  it("should update task description", async () => {
    const task = Task.create("Original description");
    await repository.save(task);

    const updated = await useCase.execute(task.uuid!, "Updated description");

    expect(updated.description).toBe("Updated description");
    expect(updated.uuid).toBe(task.uuid);
  });

  it("should update updatedAt timestamp", async () => {
    const task = Task.create("Original");
    await repository.save(task);
    const originalUpdatedAt = task.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 10));

    const updated = await useCase.execute(task.uuid!, "Updated");

    expect(updated.updatedAt).not.toBe(originalUpdatedAt);
  });

  it("should throw TaskNotFoundError if task doesn't exist", async () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;

    await expect(useCase.execute(uuid, "New description")).rejects.toThrow(
      TaskNotFoundError
    );
  });

  it("should throw InvalidTaskError if description is empty", async () => {
    const task = Task.create("Original");
    await repository.save(task);

    await expect(useCase.execute(task.uuid!, "")).rejects.toThrow(
      InvalidTaskError
    );
  });

  it("should throw InvalidTaskError if description exceeds 500 characters", async () => {
    const task = Task.create("Original");
    await repository.save(task);
    const longDescription = "a".repeat(501);

    await expect(useCase.execute(task.uuid!, longDescription)).rejects.toThrow(
      InvalidTaskError
    );
  });

  it("should trim description whitespace", async () => {
    const task = Task.create("Original");
    await repository.save(task);

    const updated = await useCase.execute(task.uuid!, "  Updated  ");

    expect(updated.description).toBe("Updated");
  });
});

