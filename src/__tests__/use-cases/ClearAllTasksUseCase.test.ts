import { ClearAllTasksUseCase } from "../../use-cases/ClearAllTasksUseCase.js";
import { MockTaskRepository } from "../helpers/mocks/MockTaskRepository.js";
import { Task } from "../../domain/entities/Task.js";

describe("ClearAllTasksUseCase", () => {
  let useCase: ClearAllTasksUseCase;
  let repository: MockTaskRepository;

  beforeEach(() => {
    repository = new MockTaskRepository();
    useCase = new ClearAllTasksUseCase(repository);
  });

  it("should clear all tasks", async () => {
    const task1 = Task.create("Task 1");
    const task2 = Task.create("Task 2");
    await repository.save(task1);
    await repository.save(task2);

    await useCase.execute();

    const tasks = await repository.findAll();
    expect(tasks).toEqual([]);
  });

  it("should not throw if no tasks exist", async () => {
    await expect(useCase.execute()).resolves.not.toThrow();
  });

  it("should clear tasks and allow adding new ones", async () => {
    const task1 = Task.create("Task 1");
    await repository.save(task1);

    await useCase.execute();

    const task2 = Task.create("Task 2");
    await repository.save(task2);

    const tasks = await repository.findAll();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].description).toBe("Task 2");
  });
});

