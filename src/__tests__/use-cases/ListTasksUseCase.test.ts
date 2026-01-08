import { ListTasksUseCase } from "../../use-cases/ListTasksUseCase.js";
import { MockTaskRepository } from "../helpers/mocks/MockTaskRepository.js";
import { InvalidTaskError } from "../../domain/errors/InvalidTaskError.js";
import { Task } from "../../domain/entities/Task.js";

describe("ListTasksUseCase", () => {
  let useCase: ListTasksUseCase;
  let repository: MockTaskRepository;

  beforeEach(() => {
    repository = new MockTaskRepository();
    useCase = new ListTasksUseCase(repository);
  });

  it("should return all tasks when no filter is provided", async () => {
    const task1 = Task.create("Task 1");
    const task2 = Task.create("Task 2");
    await repository.save(task1);
    await repository.save(task2);

    const tasks = await useCase.execute();

    expect(tasks).toHaveLength(2);
  });

  it("should return empty array when no tasks exist", async () => {
    const tasks = await useCase.execute();

    expect(tasks).toEqual([]);
  });

  it("should filter tasks by status", async () => {
    const task1 = Task.create("Task 1");
    const task2 = Task.create("Task 2");
    const task3 = Task.create("Task 3");

    // Set different statuses
    task1.status = "todo";
    task2.status = "in_progress";
    task3.status = "done";

    await repository.save(task1);
    await repository.save(task2);
    await repository.save(task3);

    const todoTasks = await useCase.execute("todo");
    expect(todoTasks).toHaveLength(1);
    expect(todoTasks[0].status).toBe("todo");

    const inProgressTasks = await useCase.execute("in_progress");
    expect(inProgressTasks).toHaveLength(1);
    expect(inProgressTasks[0].status).toBe("in_progress");

    const doneTasks = await useCase.execute("done");
    expect(doneTasks).toHaveLength(1);
    expect(doneTasks[0].status).toBe("done");
  });

  it("should normalize CLI format status filter", async () => {
    const task = Task.create("Task 1");
    task.status = "in_progress";
    await repository.save(task);

    const tasks = await useCase.execute("in-progress");

    expect(tasks).toHaveLength(1);
    expect(tasks[0].status).toBe("in_progress");
  });

  it("should throw InvalidTaskError for invalid status filter", async () => {
    await expect(useCase.execute("invalid")).rejects.toThrow(InvalidTaskError);
  });

  it("should return empty array when no tasks match filter", async () => {
    const task = Task.create("Task 1");
    task.status = "todo";
    await repository.save(task);

    const tasks = await useCase.execute("done");

    expect(tasks).toEqual([]);
  });
});

