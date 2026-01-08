import { CommandRouter } from "../../../presentation/cli/CommandRouter.js";
import { CommandRegistry } from "../../../presentation/commands/CommandRegistry.js";
import { HelpCommand } from "../../../presentation/commands/HelpCommand.js";
import { ICommand } from "../../../presentation/commands/ICommand.js";
import { Command } from "../../../types/Command.js";
import { IParsedArgs } from "../../../interfaces/IParsedArgs.js";

// Mock command
class MockCommand implements ICommand {
  constructor(private commandName: Command) {}

  canHandle(command: Command): boolean {
    return command === this.commandName;
  }

  async execute(args: IParsedArgs): Promise<string> {
    return `Executed ${this.commandName}`;
  }
}

describe("CommandRouter", () => {
  let router: CommandRouter;
  let registry: CommandRegistry;
  let helpCommand: HelpCommand;

  beforeEach(() => {
    registry = new CommandRegistry();
    helpCommand = new HelpCommand();
    router = new CommandRouter(registry, helpCommand);
  });

  it("should route to help if no command", async () => {
    const result = await router.route({ command: null });
    expect(result).toContain("Task Tracker CLI");
  });

  it("should route to registered command", async () => {
    const command = new MockCommand("add");
    registry.register(command);

    const result = await router.route({
      command: "add",
      description: "Test",
    });

    expect(result).toBe("Executed add");
  });

  it("should route to help if command not found", async () => {
    const result = await router.route({ command: "unknown" as Command });
    expect(result).toContain("Task Tracker CLI");
  });

  it("should handle command errors", async () => {
    const errorCommand: ICommand = {
      canHandle: (cmd: Command) => cmd === "add",
      execute: async () => {
        throw new Error("Test error");
      },
    };
    registry.register(errorCommand);

    const result = await router.route({
      command: "add",
      description: "Test",
    });

    expect(result).toBe("Error: Test error");
  });
});


