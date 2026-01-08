/**
 * Simple Dependency Injection Container
 * Supports singleton and transient registrations
 */
export class Container {
  private singletons: Map<string, any> = new Map();
  private factories: Map<string, () => any> = new Map();
  private transientFactories: Map<string, () => any> = new Map();

  /**
   * Register a singleton instance
   * @param key - Unique identifier for the dependency
   * @param instance - The instance to register
   */
  register<T>(key: string, instance: T): void {
    this.singletons.set(key, instance);
  }

  /**
   * Register a factory function for singleton creation
   * The factory will be called once, and the result cached
   * @param key - Unique identifier for the dependency
   * @param factory - Factory function that creates the instance
   */
  registerSingleton<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  /**
   * Register a factory function for transient creation
   * The factory will be called each time resolve is called
   * @param key - Unique identifier for the dependency
   * @param factory - Factory function that creates the instance
   */
  registerTransient<T>(key: string, factory: () => T): void {
    this.transientFactories.set(key, factory);
  }

  /**
   * Resolve a dependency by key
   * @param key - Unique identifier for the dependency
   * @returns The resolved instance
   * @throws Error if dependency is not registered
   */
  resolve<T>(key: string): T {
    // Check if singleton instance exists
    if (this.singletons.has(key)) {
      return this.singletons.get(key) as T;
    }

    // Check if singleton factory exists
    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!;
      const instance = factory();
      this.singletons.set(key, instance);
      this.factories.delete(key); // Remove factory after first use
      return instance as T;
    }

    // Check if transient factory exists
    if (this.transientFactories.has(key)) {
      const factory = this.transientFactories.get(key)!;
      return factory() as T;
    }

    throw new Error(`Dependency not found: ${key}`);
  }

  /**
   * Check if a dependency is registered
   * @param key - Unique identifier for the dependency
   * @returns True if registered, false otherwise
   */
  has(key: string): boolean {
    return (
      this.singletons.has(key) ||
      this.factories.has(key) ||
      this.transientFactories.has(key)
    );
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.singletons.clear();
    this.factories.clear();
    this.transientFactories.clear();
  }
}

