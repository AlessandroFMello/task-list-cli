/**
 * Setup test - validates that Jest is configured correctly
 */
describe('Jest Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should support TypeScript', () => {
    const value: number = 42;
    expect(value).toBe(42);
  });

  it('should support ES modules', async () => {
    const module = await import('node:path');
    expect(module).toBeDefined();
  });
});

