import path from "node:path";
import { fileURLToPath } from "node:url";
import { Container } from "./Container.js";
import { NodeFileSystem } from "../file-system/NodeFileSystem.js";
import { StateManager } from "../state/StateManager.js";
import { FileSystemTaskRepository } from "../repositories/FileSystemTaskRepository.js";
import { AddTaskUseCase } from "../../use-cases/AddTaskUseCase.js";
import { UpdateTaskUseCase } from "../../use-cases/UpdateTaskUseCase.js";
import { DeleteTaskUseCase } from "../../use-cases/DeleteTaskUseCase.js";
import { UpdateTaskStatusUseCase } from "../../use-cases/UpdateTaskStatusUseCase.js";
import { ListTasksUseCase } from "../../use-cases/ListTasksUseCase.js";
import { ClearAllTasksUseCase } from "../../use-cases/ClearAllTasksUseCase.js";
import { SetFileDateUseCase } from "../../use-cases/SetFileDateUseCase.js";
import { ListFilesUseCase } from "../../use-cases/ListFilesUseCase.js";
import { DateFormatter } from "../../presentation/formatters/DateFormatter.js";
import { TaskFormatter } from "../../presentation/formatters/TaskFormatter.js";
import { ReadlineConfirmationService } from "../../presentation/cli/ReadlineConfirmationService.js";
import { ArgumentParser } from "../../presentation/cli/ArgumentParser.js";
import { CommandRegistry } from "../../presentation/commands/CommandRegistry.js";
import { HelpCommand } from "../../presentation/commands/HelpCommand.js";
import { AddCommand } from "../../presentation/commands/AddCommand.js";
import { UpdateCommand } from "../../presentation/commands/UpdateCommand.js";
import { DeleteCommand } from "../../presentation/commands/DeleteCommand.js";
import { MarkInProgressCommand } from "../../presentation/commands/MarkInProgressCommand.js";
import { MarkDoneCommand } from "../../presentation/commands/MarkDoneCommand.js";
import { ListCommand } from "../../presentation/commands/ListCommand.js";
import { ClearCommand } from "../../presentation/commands/ClearCommand.js";
import { SetFileDateCommand } from "../../presentation/commands/SetFileDateCommand.js";
import { ListFilesCommand } from "../../presentation/commands/ListFilesCommand.js";
import { LsCommand } from "../../presentation/commands/LsCommand.js";
import { CurrentFileCommand } from "../../presentation/commands/CurrentFileCommand.js";
import { CommandRouter } from "../../presentation/cli/CommandRouter.js";
import { CLI } from "../../presentation/cli/CLI.js";
import { getTasksFilePath } from "../../helpers/getTasksFilePath.js";

/**
 * Dependency keys for the container
 */
export const DI_KEYS = {
  // Infrastructure
  FILE_SYSTEM: "fileSystem",
  TASKS_DIRECTORY: "tasksDirectory",
  DEFAULT_TASKS_FILE_PATH: "defaultTasksFilePath",
  STATE_MANAGER: "stateManager",
  TASK_REPOSITORY: "taskRepository",

  // Use Cases
  ADD_TASK_USE_CASE: "addTaskUseCase",
  UPDATE_TASK_USE_CASE: "updateTaskUseCase",
  DELETE_TASK_USE_CASE: "deleteTaskUseCase",
  UPDATE_TASK_STATUS_USE_CASE: "updateTaskStatusUseCase",
  LIST_TASKS_USE_CASE: "listTasksUseCase",
  CLEAR_ALL_TASKS_USE_CASE: "clearAllTasksUseCase",
  SET_FILE_DATE_USE_CASE: "setFileDateUseCase",
  LIST_FILES_USE_CASE: "listFilesUseCase",

  // Formatters
  DATE_FORMATTER: "dateFormatter",
  TASK_FORMATTER: "taskFormatter",

  // Services
  CONFIRMATION_SERVICE: "confirmationService",

  // CLI Components
  ARGUMENT_PARSER: "argumentParser",
  COMMAND_REGISTRY: "commandRegistry",
  HELP_COMMAND: "helpCommand",
  COMMAND_ROUTER: "commandRouter",
  CLI: "cli",

  // Commands
  ADD_COMMAND: "addCommand",
  UPDATE_COMMAND: "updateCommand",
  DELETE_COMMAND: "deleteCommand",
  MARK_IN_PROGRESS_COMMAND: "markInProgressCommand",
  MARK_DONE_COMMAND: "markDoneCommand",
  LIST_COMMAND: "listCommand",
  CLEAR_COMMAND: "clearCommand",
  SET_FILE_DATE_COMMAND: "setFileDateCommand",
  LIST_FILES_COMMAND: "listFilesCommand",
  LS_COMMAND: "lsCommand",
  CURRENT_FILE_COMMAND: "currentFileCommand",
} as const;

/**
 * Get the project root directory
 */
function getProjectRoot(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // Navigate from dist/infrastructure/di/ to project root
  // dist/infrastructure/di/ -> dist/infrastructure/ -> dist/ -> project root
  return path.resolve(__dirname, "../../..");
}

/**
 * Setup and register all dependencies in the container
 * @param container - The DI container
 */
export function setupContainer(container: Container): void {
  // Infrastructure - Singletons
  container.registerSingleton(DI_KEYS.FILE_SYSTEM, () => new NodeFileSystem());

  container.register(DI_KEYS.TASKS_DIRECTORY, (() => {
    const projectRoot = getProjectRoot();
    return path.join(projectRoot, "src/tasks");
  })());

  container.register(DI_KEYS.DEFAULT_TASKS_FILE_PATH, getTasksFilePath());

  container.registerSingleton(DI_KEYS.STATE_MANAGER, () => {
    const fileSystem = container.resolve<NodeFileSystem>(DI_KEYS.FILE_SYSTEM);
    const tasksDirectory = container.resolve<string>(DI_KEYS.TASKS_DIRECTORY);
    return new StateManager(fileSystem, tasksDirectory);
  });

  container.registerSingleton(DI_KEYS.TASK_REPOSITORY, () => {
    const fileSystem = container.resolve<NodeFileSystem>(DI_KEYS.FILE_SYSTEM);
    const defaultTasksFilePath = container.resolve<string>(DI_KEYS.DEFAULT_TASKS_FILE_PATH);
    return new FileSystemTaskRepository(defaultTasksFilePath, fileSystem);
  });

  // Use Cases - Singletons
  container.registerSingleton(DI_KEYS.ADD_TASK_USE_CASE, () => {
    const taskRepository = container.resolve<FileSystemTaskRepository>(DI_KEYS.TASK_REPOSITORY);
    return new AddTaskUseCase(taskRepository);
  });

  container.registerSingleton(DI_KEYS.UPDATE_TASK_USE_CASE, () => {
    const taskRepository = container.resolve<FileSystemTaskRepository>(DI_KEYS.TASK_REPOSITORY);
    return new UpdateTaskUseCase(taskRepository);
  });

  container.registerSingleton(DI_KEYS.DELETE_TASK_USE_CASE, () => {
    const taskRepository = container.resolve<FileSystemTaskRepository>(DI_KEYS.TASK_REPOSITORY);
    return new DeleteTaskUseCase(taskRepository);
  });

  container.registerSingleton(DI_KEYS.UPDATE_TASK_STATUS_USE_CASE, () => {
    const taskRepository = container.resolve<FileSystemTaskRepository>(DI_KEYS.TASK_REPOSITORY);
    return new UpdateTaskStatusUseCase(taskRepository);
  });

  container.registerSingleton(DI_KEYS.LIST_TASKS_USE_CASE, () => {
    const taskRepository = container.resolve<FileSystemTaskRepository>(DI_KEYS.TASK_REPOSITORY);
    return new ListTasksUseCase(taskRepository);
  });

  container.registerSingleton(DI_KEYS.CLEAR_ALL_TASKS_USE_CASE, () => {
    const taskRepository = container.resolve<FileSystemTaskRepository>(DI_KEYS.TASK_REPOSITORY);
    return new ClearAllTasksUseCase(taskRepository);
  });

  container.registerSingleton(DI_KEYS.SET_FILE_DATE_USE_CASE, () => {
    const stateManager = container.resolve<StateManager>(DI_KEYS.STATE_MANAGER);
    const fileSystem = container.resolve<NodeFileSystem>(DI_KEYS.FILE_SYSTEM);
    const tasksDirectory = container.resolve<string>(DI_KEYS.TASKS_DIRECTORY);
    return new SetFileDateUseCase(stateManager, fileSystem, tasksDirectory);
  });

  container.registerSingleton(DI_KEYS.LIST_FILES_USE_CASE, () => {
    const fileSystem = container.resolve<NodeFileSystem>(DI_KEYS.FILE_SYSTEM);
    const tasksDirectory = container.resolve<string>(DI_KEYS.TASKS_DIRECTORY);
    return new ListFilesUseCase(fileSystem, tasksDirectory);
  });

  // Formatters - Singletons
  container.registerSingleton(DI_KEYS.DATE_FORMATTER, () => new DateFormatter());

  container.registerSingleton(DI_KEYS.TASK_FORMATTER, () => {
    const dateFormatter = container.resolve<DateFormatter>(DI_KEYS.DATE_FORMATTER);
    return new TaskFormatter(dateFormatter);
  });

  // Services - Singletons
  container.registerSingleton(
    DI_KEYS.CONFIRMATION_SERVICE,
    () => new ReadlineConfirmationService()
  );

  // CLI Components - Singletons
  container.registerSingleton(
    DI_KEYS.ARGUMENT_PARSER,
    () => new ArgumentParser()
  );

  container.registerSingleton(
    DI_KEYS.COMMAND_REGISTRY,
    () => new CommandRegistry()
  );

  container.registerSingleton(DI_KEYS.HELP_COMMAND, () => new HelpCommand());

  // Commands - Singletons
  container.registerSingleton(DI_KEYS.ADD_COMMAND, () => {
    const addTaskUseCase = container.resolve<AddTaskUseCase>(DI_KEYS.ADD_TASK_USE_CASE);
    return new AddCommand(addTaskUseCase);
  });

  container.registerSingleton(DI_KEYS.UPDATE_COMMAND, () => {
    const updateTaskUseCase = container.resolve<UpdateTaskUseCase>(DI_KEYS.UPDATE_TASK_USE_CASE);
    return new UpdateCommand(updateTaskUseCase);
  });

  container.registerSingleton(DI_KEYS.DELETE_COMMAND, () => {
    const deleteTaskUseCase = container.resolve<DeleteTaskUseCase>(DI_KEYS.DELETE_TASK_USE_CASE);
    return new DeleteCommand(deleteTaskUseCase);
  });

  container.registerSingleton(DI_KEYS.MARK_IN_PROGRESS_COMMAND, () => {
    const updateTaskStatusUseCase = container.resolve<UpdateTaskStatusUseCase>(
      DI_KEYS.UPDATE_TASK_STATUS_USE_CASE
    );
    return new MarkInProgressCommand(updateTaskStatusUseCase);
  });

  container.registerSingleton(DI_KEYS.MARK_DONE_COMMAND, () => {
    const updateTaskStatusUseCase = container.resolve<UpdateTaskStatusUseCase>(
      DI_KEYS.UPDATE_TASK_STATUS_USE_CASE
    );
    return new MarkDoneCommand(updateTaskStatusUseCase);
  });

  container.registerSingleton(DI_KEYS.LIST_COMMAND, () => {
    const listTasksUseCase = container.resolve<ListTasksUseCase>(DI_KEYS.LIST_TASKS_USE_CASE);
    const taskFormatter = container.resolve<TaskFormatter>(DI_KEYS.TASK_FORMATTER);
    return new ListCommand(listTasksUseCase, taskFormatter);
  });

  container.registerSingleton(DI_KEYS.CLEAR_COMMAND, () => {
    const clearAllTasksUseCase = container.resolve<ClearAllTasksUseCase>(
      DI_KEYS.CLEAR_ALL_TASKS_USE_CASE
    );
    const confirmationService = container.resolve<ReadlineConfirmationService>(
      DI_KEYS.CONFIRMATION_SERVICE
    );
    return new ClearCommand(clearAllTasksUseCase, confirmationService);
  });

  container.registerSingleton(DI_KEYS.SET_FILE_DATE_COMMAND, () => {
    const setFileDateUseCase = container.resolve<SetFileDateUseCase>(DI_KEYS.SET_FILE_DATE_USE_CASE);
    return new SetFileDateCommand(setFileDateUseCase);
  });

  container.registerSingleton(DI_KEYS.LIST_FILES_COMMAND, () => {
    const listFilesUseCase = container.resolve<ListFilesUseCase>(DI_KEYS.LIST_FILES_USE_CASE);
    const dateFormatter = container.resolve<DateFormatter>(DI_KEYS.DATE_FORMATTER);
    return new ListFilesCommand(listFilesUseCase, dateFormatter);
  });

  container.registerSingleton(DI_KEYS.LS_COMMAND, () => {
    const listTasksUseCase = container.resolve<ListTasksUseCase>(DI_KEYS.LIST_TASKS_USE_CASE);
    const taskFormatter = container.resolve<TaskFormatter>(DI_KEYS.TASK_FORMATTER);
    return new LsCommand(listTasksUseCase, taskFormatter);
  });

  container.registerSingleton(DI_KEYS.CURRENT_FILE_COMMAND, () => {
    const stateManager = container.resolve<StateManager>(DI_KEYS.STATE_MANAGER);
    const tasksDirectory = container.resolve<string>(DI_KEYS.TASKS_DIRECTORY);
    return new CurrentFileCommand(stateManager, tasksDirectory);
  });

  // Register all commands in registry
  const commandRegistry = container.resolve<CommandRegistry>(DI_KEYS.COMMAND_REGISTRY);
  commandRegistry.register(container.resolve<AddCommand>(DI_KEYS.ADD_COMMAND));
  commandRegistry.register(container.resolve<UpdateCommand>(DI_KEYS.UPDATE_COMMAND));
  commandRegistry.register(container.resolve<DeleteCommand>(DI_KEYS.DELETE_COMMAND));
  commandRegistry.register(container.resolve<MarkInProgressCommand>(DI_KEYS.MARK_IN_PROGRESS_COMMAND));
  commandRegistry.register(container.resolve<MarkDoneCommand>(DI_KEYS.MARK_DONE_COMMAND));
  commandRegistry.register(container.resolve<ListCommand>(DI_KEYS.LIST_COMMAND));
  commandRegistry.register(container.resolve<ClearCommand>(DI_KEYS.CLEAR_COMMAND));
  commandRegistry.register(container.resolve<SetFileDateCommand>(DI_KEYS.SET_FILE_DATE_COMMAND));
  commandRegistry.register(container.resolve<ListFilesCommand>(DI_KEYS.LIST_FILES_COMMAND));
  commandRegistry.register(container.resolve<LsCommand>(DI_KEYS.LS_COMMAND));
  commandRegistry.register(container.resolve<CurrentFileCommand>(DI_KEYS.CURRENT_FILE_COMMAND));

  // Command Router
  container.registerSingleton(DI_KEYS.COMMAND_ROUTER, () => {
    const commandRegistry = container.resolve<CommandRegistry>(DI_KEYS.COMMAND_REGISTRY);
    const helpCommand = container.resolve<HelpCommand>(DI_KEYS.HELP_COMMAND);
    return new CommandRouter(commandRegistry, helpCommand);
  });

  // CLI
  container.registerSingleton(DI_KEYS.CLI, () => {
    const argumentParser = container.resolve<ArgumentParser>(DI_KEYS.ARGUMENT_PARSER);
    const commandRouter = container.resolve<CommandRouter>(DI_KEYS.COMMAND_ROUTER);
    return new CLI(argumentParser, commandRouter);
  });
}

