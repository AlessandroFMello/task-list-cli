import { AddTaskUseCase } from "../../use-cases/AddTaskUseCase.js";
import { ITaskRepository } from "../../domain/repositories/ITaskRepository.js";
import { ITask } from "../../interfaces/ITask.js";
import { InvalidTaskError } from "../../domain/errors/InvalidTaskError.js";
import { UUID } from "node:crypto";

// Mock repository
class MockTaskRepository implements ITaskRepository {
  private tasks: ITask[] = [];

  async findAll(): Promise<ITask[]> {
    return [...this.tasks];
  }

  async findById(uuid: UUID): Promise<ITask | null> {
    return this.tasks.find((t) => t.uuid === uuid) || null;
  }

  async save(task: ITask): Promise<void> {
    const index = this.tasks.findIndex((t) => t.uuid === task.uuid);
    if (index !== -1) {
      this.tasks[index] = task;
    } else {
      this.tasks.push(task);
    }
  }

  async saveAll(tasks: ITask[]): Promise<void> {
    this.tasks = [...tasks];
  }

  async delete(uuid: UUID): Promise<void> {
    this.tasks = this.tasks.filter((t) => t.uuid !== uuid);
  }

  async exists(uuid: UUID): Promise<boolean> {
    return this.tasks.some((t) => t.uuid === uuid);
  }
}

describe("AddTaskUseCase", () => {
  let useCase: AddTaskUseCase;
  let repository: MockTaskRepository;

  beforeEach(() => {
    repository = new MockTaskRepository();
    useCase = new AddTaskUseCase(repository);
  });

  it("should create task with valid description", async () => {
    const description = "Test task";

    const task = await useCase.execute(description);

    expect(task.description).toBe(description);
    expect(task.status).toBe("todo");
    expect(task.uuid).toBeDefined();
    expect(task.createdAt).toBeDefined();
    expect(task.updatedAt).toBeDefined();
  });

  it("should save task to repository", async () => {
    const description = "Test task";

    const task = await useCase.execute(description);

    const saved = await repository.findById(task.uuid!);
    expect(saved).toEqual(task);
  });

  it("should throw InvalidTaskError if description is empty", async () => {
    await expect(useCase.execute("")).rejects.toThrow(InvalidTaskError);
    await expect(useCase.execute("   ")).rejects.toThrow(InvalidTaskError);
  });

  it("should throw InvalidTaskError if description exceeds 500 characters", async () => {
    const longDescription = "a".repeat(501);

    await expect(useCase.execute(longDescription)).rejects.toThrow(
      InvalidTaskError
    );
  });

  it("should trim description whitespace", async () => {
    const task = await useCase.execute("  Test task  ");

    expect(task.description).toBe("Test task");
  });

  it("should generate unique UUIDs for different tasks", async () => {
    const task1 = await useCase.execute("Task 1");
    const task2 = await useCase.execute("Task 2");

    expect(task1.uuid).not.toBe(task2.uuid);
  });
});

