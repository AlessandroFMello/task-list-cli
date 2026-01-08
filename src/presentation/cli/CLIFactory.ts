import { CLI } from "./CLI.js";
import { Container } from "../../infrastructure/di/Container.js";
import { setupContainer, DI_KEYS } from "../../infrastructure/di/setup.js";

/**
 * Factory to create and configure CLI with all dependencies using DI Container
 */
export class CLIFactory {
  static create(): CLI {
    const container = new Container();
    setupContainer(container);
    return container.resolve<CLI>(DI_KEYS.CLI);
  }
}

