import { ITaskRepository } from "../../../domain/repositories/ITaskRepository.js";
import { UUID } from "node:crypto";

/**
 * Mock implementation of ITaskRepository for testing
 */
export class MockTaskRepository implements ITaskRepository {
  private tasks: Map<UUID, any> = new Map();

  async findAll(): Promise<any[]> {
    return Array.from(this.tasks.values());
  }

  async findById(uuid: UUID): Promise<any | null> {
    return this.tasks.get(uuid) || null;
  }

  async save(task: any): Promise<void> {
    if (task.uuid) {
      this.tasks.set(task.uuid, task);
    }
  }

  async saveAll(tasks: any[]): Promise<void> {
    for (const task of tasks) {
      await this.save(task);
    }
  }

  async delete(uuid: UUID): Promise<void> {
    this.tasks.delete(uuid);
  }

  async exists(uuid: UUID): Promise<boolean> {
    return this.tasks.has(uuid);
  }
}

describe("ITaskRepository", () => {
  it("should be an interface that can be implemented", () => {
    const repository: ITaskRepository = new MockTaskRepository();
    expect(repository).toBeDefined();
    expect(typeof repository.findAll).toBe("function");
    expect(typeof repository.findById).toBe("function");
    expect(typeof repository.save).toBe("function");
    expect(typeof repository.saveAll).toBe("function");
    expect(typeof repository.delete).toBe("function");
    expect(typeof repository.exists).toBe("function");
  });

  it("should allow mock implementation", async () => {
    const repository = new MockTaskRepository();
    const task = {
      uuid: "123e4567-e89b-12d3-a456-426614174000" as UUID,
      description: "Test task",
      status: "todo" as const,
    };

    await repository.save(task);
    const found = await repository.findById(task.uuid);
    expect(found).toEqual(task);
    expect(await repository.exists(task.uuid)).toBe(true);
  });
});

