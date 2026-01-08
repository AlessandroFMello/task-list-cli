import { Container } from "../../../infrastructure/di/Container.js";

describe("Container", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe("register", () => {
    it("should register and resolve a singleton instance", () => {
      const instance = { value: "test" };
      container.register("test", instance);

      const resolved = container.resolve("test");
      expect(resolved).toBe(instance);
    });

    it("should return the same instance on multiple resolves", () => {
      const instance = { value: "test" };
      container.register("test", instance);

      const resolved1 = container.resolve("test");
      const resolved2 = container.resolve("test");

      expect(resolved1).toBe(resolved2);
      expect(resolved1).toBe(instance);
    });
  });

  describe("registerSingleton", () => {
    it("should create and cache singleton instance", () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { value: callCount };
      };

      container.registerSingleton("test", factory);

      const instance1 = container.resolve<{ value: number }>("test");
      const instance2 = container.resolve<{ value: number }>("test");

      expect(callCount).toBe(1); // Factory called only once
      expect(instance1).toBe(instance2);
      expect(instance1.value).toBe(1);
    });
  });

  describe("registerTransient", () => {
    it("should create new instance on each resolve", () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { value: callCount };
      };

      container.registerTransient("test", factory);

      const instance1 = container.resolve<{ value: number }>("test");
      const instance2 = container.resolve<{ value: number }>("test");

      expect(callCount).toBe(2); // Factory called twice
      expect(instance1).not.toBe(instance2);
      expect(instance1.value).toBe(1);
      expect(instance2.value).toBe(2);
    });
  });

  describe("resolve", () => {
    it("should throw error if dependency not found", () => {
      expect(() => container.resolve("nonexistent")).toThrow(
        "Dependency not found: nonexistent"
      );
    });
  });

  describe("has", () => {
    it("should return true if dependency is registered", () => {
      container.register("test", {});
      expect(container.has("test")).toBe(true);
    });

    it("should return true if singleton factory is registered", () => {
      container.registerSingleton("test", () => ({}));
      expect(container.has("test")).toBe(true);
    });

    it("should return true if transient factory is registered", () => {
      container.registerTransient("test", () => ({}));
      expect(container.has("test")).toBe(true);
    });

    it("should return false if dependency is not registered", () => {
      expect(container.has("nonexistent")).toBe(false);
    });
  });

  describe("clear", () => {
    it("should clear all registrations", () => {
      container.register("test1", {});
      container.registerSingleton("test2", () => ({}));
      container.registerTransient("test3", () => ({}));

      container.clear();

      expect(container.has("test1")).toBe(false);
      expect(container.has("test2")).toBe(false);
      expect(container.has("test3")).toBe(false);
    });
  });
});

