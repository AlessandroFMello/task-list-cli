import { CLI } from "../../../presentation/cli/CLI.js";
import { ArgumentParser } from "../../../presentation/cli/ArgumentParser.js";
import { CommandRouter } from "../../../presentation/cli/CommandRouter.js";
import { CommandRegistry } from "../../../presentation/commands/CommandRegistry.js";
import { HelpCommand } from "../../../presentation/commands/HelpCommand.js";

describe("CLI (Refactored)", () => {
  let cli: CLI;
  let argumentParser: ArgumentParser;
  let commandRouter: CommandRouter;

  beforeEach(() => {
    argumentParser = new ArgumentParser();
    const registry = new CommandRegistry();
    const helpCommand = new HelpCommand();
    commandRouter = new CommandRouter(registry, helpCommand);
    cli = new CLI(argumentParser, commandRouter);
  });

  it("should parse arguments", () => {
    const result = cli.parseArguments(["node", "script.js", "add", "Test"]);

    expect(result.command).toBe("add");
    expect(result.description).toBe("Test");
  });

  it("should route commands", async () => {
    const parsedArgs = cli.parseArguments(["node", "script.js"]);
    const result = await cli.routeCommand(parsedArgs);

    expect(result).toContain("Task Tracker CLI");
  });
});
