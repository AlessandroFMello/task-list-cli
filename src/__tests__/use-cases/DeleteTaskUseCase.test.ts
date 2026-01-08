import { DeleteTaskUseCase } from "../../use-cases/DeleteTaskUseCase.js";
import { MockTaskRepository } from "../helpers/mocks/MockTaskRepository.js";
import { TaskNotFoundError } from "../../domain/errors/TaskNotFoundError.js";
import { UUID } from "node:crypto";
import { Task } from "../../domain/entities/Task.js";

describe("DeleteTaskUseCase", () => {
  let useCase: DeleteTaskUseCase;
  let repository: MockTaskRepository;

  beforeEach(() => {
    repository = new MockTaskRepository();
    useCase = new DeleteTaskUseCase(repository);
  });

  it("should delete existing task", async () => {
    const task = Task.create("Task to delete");
    await repository.save(task);

    await useCase.execute(task.uuid!);

    const found = await repository.findById(task.uuid!);
    expect(found).toBeNull();
  });

  it("should throw TaskNotFoundError if task doesn't exist", async () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;

    await expect(useCase.execute(uuid)).rejects.toThrow(TaskNotFoundError);
  });

  it("should not affect other tasks", async () => {
    const task1 = Task.create("Task 1");
    const task2 = Task.create("Task 2");
    await repository.save(task1);
    await repository.save(task2);

    await useCase.execute(task1.uuid!);

    const found1 = await repository.findById(task1.uuid!);
    const found2 = await repository.findById(task2.uuid!);

    expect(found1).toBeNull();
    expect(found2).not.toBeNull();
  });
});

