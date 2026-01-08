import { CLIFactory } from "../../presentation/cli/CLIFactory.js";
import { CLI } from "../../presentation/cli/CLI.js";
import { IParsedArgs } from "../../interfaces/IParsedArgs.js";
import { UUID } from "node:crypto";

describe("Edge Cases - Error Handling", () => {
  let cli: CLI;

  beforeEach(() => {
    cli = CLIFactory.create();
  });

  describe("Invalid UUID", () => {
    it("should handle invalid UUID format in update", async () => {
      const args: IParsedArgs = {
        command: "update",
        uuid: "invalid-uuid" as UUID,
        description: "Test",
      };

      const result = await cli.routeCommand(args);
      expect(result).toContain("Error:");
    });

    it("should handle invalid UUID format in delete", async () => {
      const args: IParsedArgs = {
        command: "delete",
        uuid: "invalid-uuid" as UUID,
      };

      const result = await cli.routeCommand(args);
      expect(result).toContain("Error:");
    });

    it("should handle invalid UUID format in mark-in-progress", async () => {
      const args: IParsedArgs = {
        command: "mark-in-progress",
        uuid: "invalid-uuid" as UUID,
      };

      const result = await cli.routeCommand(args);
      expect(result).toContain("Error:");
    });
  });

  describe("Non-existent Task", () => {
    it("should handle non-existent task in update", async () => {
      const nonExistentUuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;
      const args: IParsedArgs = {
        command: "update",
        uuid: nonExistentUuid,
        description: "Test",
      };

      const result = await cli.routeCommand(args);
      expect(result).toContain("Error:");
      expect(result).toContain("not found");
    });

    it("should handle non-existent task in delete", async () => {
      const nonExistentUuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;
      const args: IParsedArgs = {
        command: "delete",
        uuid: nonExistentUuid,
      };

      const result = await cli.routeCommand(args);
      expect(result).toContain("Error:");
      expect(result).toContain("not found");
    });
  });

  describe("Invalid Date Format", () => {
    it("should handle invalid date format in set-file-date", async () => {
      const args: IParsedArgs = {
        command: "set-file-date",
        date: "invalid-date",
      };

      const result = await cli.routeCommand(args);
      expect(result).toContain("Error:");
      expect(result).toContain("Invalid date format");
    });

    it("should handle non-existent date file in set-file-date", async () => {
      const args: IParsedArgs = {
        command: "set-file-date",
        date: "2099-12-31",
      };

      const result = await cli.routeCommand(args);
      expect(result).toContain("Error:");
      expect(result).toContain("does not exist");
    });
  });

  describe("Invalid Status Filter", () => {
    it("should handle invalid status in list command", async () => {
      const args: IParsedArgs = {
        command: "list",
        statusFilter: "invalid-status" as any,
      };

      const result = await cli.routeCommand(args);
      expect(result).toContain("Error:");
    });
  });

  describe("Missing Required Arguments", () => {
    it("should handle missing description in add", async () => {
      const args: IParsedArgs = {
        command: "add",
      };

      const result = await cli.routeCommand(args);
      expect(result).toContain("Error:");
      expect(result).toContain("required");
    });

    it("should handle missing uuid in update", async () => {
      const args: IParsedArgs = {
        command: "update",
        description: "Test",
      };

      const result = await cli.routeCommand(args);
      expect(result).toContain("Error:");
      expect(result).toContain("required");
    });

    it("should handle missing description in update", async () => {
      const uuid = "123e4567-e89b-12d3-a456-426614174000" as UUID;
      const args: IParsedArgs = {
        command: "update",
        uuid: uuid,
      };

      const result = await cli.routeCommand(args);
      expect(result).toContain("Error:");
      expect(result).toContain("required");
    });
  });

  describe("Empty Description", () => {
    it("should handle empty description in add", async () => {
      const args: IParsedArgs = {
        command: "add",
        description: "   ",
      };

      const result = await cli.routeCommand(args);
      expect(result).toContain("Error:");
      expect(result).toContain("cannot be empty");
    });

    it("should handle empty description in update", async () => {
      // First add a task
      const addArgs: IParsedArgs = {
        command: "add",
        description: "Test task",
      };
      const addResult = await cli.routeCommand(addArgs);
      const uuidMatch = addResult.match(/UUID: ([a-f0-9-]+)/i);
      const taskUuid = uuidMatch![1] as UUID;

      // Try to update with empty description
      const updateArgs: IParsedArgs = {
        command: "update",
        uuid: taskUuid,
        description: "   ",
      };

      const result = await cli.routeCommand(updateArgs);
      expect(result).toContain("Error:");
      expect(result).toContain("cannot be empty");
    });
  });
});

