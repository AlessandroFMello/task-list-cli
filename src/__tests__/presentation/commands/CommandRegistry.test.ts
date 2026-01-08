import { CommandRegistry } from "../../../presentation/commands/CommandRegistry.js";
import { ICommand } from "../../../presentation/commands/ICommand.js";
import { Command } from "../../../types/Command.js";
import { IParsedArgs } from "../../../interfaces/IParsedArgs.js";

// Mock command for testing
class MockCommand implements ICommand {
  constructor(private commandName: Command) {}

  canHandle(command: Command): boolean {
    return command === this.commandName;
  }

  async execute(args: IParsedArgs): Promise<string> {
    return `Executed ${this.commandName}`;
  }
}

describe("CommandRegistry", () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  it("should register commands", () => {
    const command = new MockCommand("add");
    registry.register(command);

    const found = registry.find("add");
    expect(found).toBe(command);
  });

  it("should return null if command not found", () => {
    const found = registry.find("add");
    expect(found).toBeNull();
  });

  it("should find correct command among multiple", () => {
    const addCommand = new MockCommand("add");
    const updateCommand = new MockCommand("update");
    registry.register(addCommand);
    registry.register(updateCommand);

    expect(registry.find("add")).toBe(addCommand);
    expect(registry.find("update")).toBe(updateCommand);
    expect(registry.find("delete")).toBeNull();
  });
});


