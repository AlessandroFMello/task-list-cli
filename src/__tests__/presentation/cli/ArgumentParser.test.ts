import { ArgumentParser } from "../../../presentation/cli/ArgumentParser.js";
import { IParsedArgs } from "../../../interfaces/IParsedArgs.js";

describe("ArgumentParser", () => {
  let parser: ArgumentParser;

  beforeEach(() => {
    parser = new ArgumentParser();
  });

  describe("parse", () => {
    it("should return null command if no arguments", () => {
      const result = parser.parse(["node", "script.js"]);
      expect(result.command).toBeNull();
    });

    it("should parse add command", () => {
      const result = parser.parse([
        "node",
        "script.js",
        "add",
        "Test task",
      ]) as IParsedArgs;

      expect(result.command).toBe("add");
      expect(result.description).toBe("Test task");
    });

    it("should throw error if add missing description", () => {
      expect(() => parser.parse(["node", "script.js", "add"])).toThrow(
        "Missing required argument: description"
      );
    });

    it("should parse update command", () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      const result = parser.parse([
        "node",
        "script.js",
        "update",
        uuid,
        "Updated description",
      ]) as IParsedArgs;

      expect(result.command).toBe("update");
      expect(result.uuid).toBe(uuid);
      expect(result.description).toBe("Updated description");
    });

    it("should throw error if update missing arguments", () => {
      expect(() =>
        parser.parse(["node", "script.js", "update", "uuid"])
      ).toThrow("Missing required arguments: UUID and description");
    });

    it("should parse delete command", () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      const result = parser.parse([
        "node",
        "script.js",
        "delete",
        uuid,
      ]) as IParsedArgs;

      expect(result.command).toBe("delete");
      expect(result.uuid).toBe(uuid);
    });

    it("should parse mark-in-progress command", () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      const result = parser.parse([
        "node",
        "script.js",
        "mark-in-progress",
        uuid,
      ]) as IParsedArgs;

      expect(result.command).toBe("mark-in-progress");
      expect(result.uuid).toBe(uuid);
    });

    it("should parse mark-done command", () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      const result = parser.parse([
        "node",
        "script.js",
        "mark-done",
        uuid,
      ]) as IParsedArgs;

      expect(result.command).toBe("mark-done");
      expect(result.uuid).toBe(uuid);
    });

    it("should parse list command without filter", () => {
      const result = parser.parse(["node", "script.js", "list"]) as IParsedArgs;

      expect(result.command).toBe("list");
      expect(result.statusFilter).toBeUndefined();
    });

    it("should parse list command with status filter", () => {
      const result = parser.parse([
        "node",
        "script.js",
        "list",
        "in-progress",
      ]) as IParsedArgs;

      expect(result.command).toBe("list");
      expect(result.statusFilter).toBe("in_progress"); // Normalized
    });

    it("should throw error for invalid status filter", () => {
      expect(() =>
        parser.parse(["node", "script.js", "list", "invalid"])
      ).toThrow("Invalid status filter");
    });

    it("should parse set-file-date command", () => {
      const result = parser.parse([
        "node",
        "script.js",
        "set-file-date",
        "2024-01-15",
      ]) as IParsedArgs;

      expect(result.command).toBe("set-file-date");
      expect(result.date).toBe("2024-01-15");
    });

    it("should throw error if set-file-date missing date", () => {
      expect(() =>
        parser.parse(["node", "script.js", "set-file-date"])
      ).toThrow("Missing required argument: date");
    });

    it("should parse list-files command", () => {
      const result = parser.parse([
        "node",
        "script.js",
        "list-files",
      ]) as IParsedArgs;

      expect(result.command).toBe("list-files");
    });

    it("should parse current-file command", () => {
      const result = parser.parse([
        "node",
        "script.js",
        "current-file",
      ]) as IParsedArgs;

      expect(result.command).toBe("current-file");
    });

    it("should parse clear command", () => {
      const result = parser.parse(["node", "script.js", "clear"]) as IParsedArgs;

      expect(result.command).toBe("clear");
    });

    it("should return null command for invalid command", () => {
      const result = parser.parse([
        "node",
        "script.js",
        "invalid-command",
      ]);

      expect(result.command).toBeNull();
    });
  });
});


