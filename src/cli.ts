import { existsSync, writeFileSync, mkdirSync, readdirSync, statSync, readFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { getFileContent } from "./helpers/getFileContent.js";
import { getTasksFilePath } from "./helpers/getTasksFilePath.js";
import { UUID } from "node:crypto";
import { ITask } from "./interfaces/ITask.js";
import { Task } from "./domain/task.js";
import { TaskStatus } from "./types/TaskStatus.js";
import { Command } from "./types/Command.js";
import { IParsedArgs } from "./interfaces/IParsedArgs.js";

export class CLI {
	private tasksFilePath: string;
	private fileContent: string;
	private allTasks: ITask[] = [];

	constructor() {
		// Initialize with a temporary path to get directory
		this.tasksFilePath = getTasksFilePath();
		// Get the actual current file path (from state or default)
		this.tasksFilePath = this.getCurrentTasksFilePath();
		this.checkFileExistence();
		this.fileContent = getFileContent(this.tasksFilePath);
		this.allTasks = this.getAllTasks();
	}

	private getStateFilePath(): string {
		const directoryPath = path.dirname(this.tasksFilePath || getTasksFilePath());
		return path.join(directoryPath, '.current-task-file');
	}

	private getCurrentTasksFilePath(): string {
		const stateFilePath = this.getStateFilePath();
		
		if (existsSync(stateFilePath)) {
			try {
				const savedPath = readFileSync(stateFilePath, "utf-8").trim();
				if (existsSync(savedPath)) {
					return savedPath;
				}
			} catch (error) {
				console.error('Error reading current tasks file:', error);
			}
		}
		
		// Return default (today's file)
		return getTasksFilePath();
	}

	private saveCurrentTasksFilePath(filePath: string): void {
		const stateFilePath = this.getStateFilePath();
		try {
			writeFileSync(stateFilePath, filePath, "utf-8");
		} catch (error) {
			// Silently fail - not critical if we can't save state
			console.error('Error saving current tasks file:', error);
		}
	}

	private saveTasks(tasks: ITask[]): void {
		const directoryPath = path.dirname(this.tasksFilePath);
		
		// Check and create directory if it doesn't exist
		if (!existsSync(directoryPath)) {
			mkdirSync(directoryPath, { recursive: true });
		}
		
		try {
			writeFileSync(this.tasksFilePath, JSON.stringify(tasks, null, 2), "utf-8");
		} catch (error: any) {
			if (error.code === 'EACCES' || error.code === 'EPERM') {
				throw new Error(`Cannot write to tasks file: permission denied`);
			}
			if (error.code === 'ENOSPC') {
				throw new Error(`Cannot save tasks: disk full`);
			}
			throw new Error(`Failed to save tasks: ${error.message}`);
		}
	}

	private checkFileExistence = () => {
		if (!this.tasksFilePath) {
			this.tasksFilePath = getTasksFilePath();
		}
		if (!existsSync(this.tasksFilePath)) {
			this.saveTasks([]);
		}
	}

	public getAllTasks = (): ITask[] => {
		try {
			const allTasks = JSON.parse(this.fileContent) satisfies ITask[];
			
			if (!Array.isArray(allTasks)) {
				throw new Error("Tasks file does not contain a valid array");
			}
			this.allTasks = [ ...allTasks ];
			return allTasks;
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new Error(`Tasks file contains invalid JSON: ${error.message}`);
			}
			throw error;
		}
	}

	public createNewTask(description: string): void {
		if (!description) {
			throw new Error("No description data provided");
		}

		const newTask = Task.create(description);

		this.allTasks.push(newTask);
		this.saveTasks(this.allTasks);
		this.fileContent = getFileContent(this.tasksFilePath);
	}

	public findTaskById(uuid: UUID): ITask {
		if (!uuid) {
			throw new Error("Task UUID is required");
		}
		try {
			const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

			if (!uuidRegex.test(uuid)) {
				throw new Error(`Invalid task uuid format: ${uuid}. Expected UUID format.`);
			}

			const taskFound = this.allTasks.find((task: ITask) => {
				return uuid === task.uuid;
			});

			if (!taskFound) {
				throw new Error(`Task with UUID ${uuid} not found.`);
			}
			return taskFound satisfies ITask;
		} catch (error) {
			throw new Error(`Error finding task by UUID: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	public updateTask(uuid: UUID, description: string): void {
		if (!uuid) {
			throw new Error("Task UUID is required");
		}
		if (!description) {
			throw new Error("Task description is required");
		}

		const task = this.findTaskById(uuid);
		task.description = description;
		task.updatedAt = new Date().toISOString();

		// Update the task in allTasks array
		const taskIndex = this.allTasks.findIndex(t => t.uuid === uuid);
		if (taskIndex !== -1) {
			this.allTasks[taskIndex] = task;
		}

		this.saveTasks(this.allTasks);
		this.fileContent = getFileContent(this.tasksFilePath);
	}

	public deleteTask(uuid: UUID): void {
		if (!uuid) {
			throw new Error("Task UUID is required");
		}

		// Check if task exists (will throw if not found)
		this.findTaskById(uuid);

		// Remove task from array
		this.allTasks = this.allTasks.filter(task => task.uuid !== uuid);
		
		this.saveTasks(this.allTasks);
		this.fileContent = getFileContent(this.tasksFilePath);
	}

	public updateTaskStatus(uuid: UUID, status: TaskStatus): void {
		if (!uuid) {
			throw new Error("Task UUID is required");
		}
		if (!status) {
			throw new Error("Task status is required");
		}

		// Validate status
		const validStatuses: TaskStatus[] = ["todo", "in_progress", "done"];
		if (!validStatuses.includes(status)) {
			throw new Error(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(", ")}`);
		}

		const task = this.findTaskById(uuid);
		task.status = status;
		task.updatedAt = new Date().toISOString();

		// Update the task in allTasks array
		const taskIndex = this.allTasks.findIndex(t => t.uuid === uuid);
		if (taskIndex !== -1) {
			this.allTasks[taskIndex] = task;
		}

		this.saveTasks(this.allTasks);
		this.fileContent = getFileContent(this.tasksFilePath);
	}

	private formatTask(task: ITask): string {
		const formatDate = (isoString: string | undefined): string => {
			if (!isoString) return "N/A";
			const date = new Date(isoString);
			return date.toLocaleString("en-US", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			});
		};

		const statusDisplay = task.status ? task.status.toUpperCase() : "N/A";
		
		return `UUID: ${task.uuid || "N/A"}
Description: ${task.description}
Status: ${statusDisplay}
Created: ${formatDate(task.createdAt)}
Updated: ${formatDate(task.updatedAt)}
---`;
	}

	public listAllTasks(): string {
		const tasks = this.getAllTasks();
		
		if (tasks.length === 0) {
			return "No tasks found.";
		}

		return tasks.map(task => this.formatTask(task)).join("\n\n");
	}

	public listTasksByStatus(status: TaskStatus): string {
		// Validate status
		const validStatuses: TaskStatus[] = ["todo", "in_progress", "done"];
		if (!validStatuses.includes(status)) {
			throw new Error(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(", ")}`);
		}

		const tasks = this.getAllTasks();
		const filteredTasks = tasks.filter(task => task.status === status);

		if (filteredTasks.length === 0) {
			return `No tasks found with status: ${status}`;
		}

		return filteredTasks.map(task => this.formatTask(task)).join("\n\n");
	}

	private askConfirmation(question: string): Promise<boolean> {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout
		});

		return new Promise((resolve) => {
			rl.question(question, (answer) => {
				rl.close();
				const normalizedAnswer = answer.trim().toLowerCase();
				resolve(normalizedAnswer === 'y' || normalizedAnswer === 'yes');
			});
		});
	}

	public async clearAllTasks(): Promise<void> {
		const confirmed = await this.askConfirmation('Are you sure you want to clear all tasks? This action cannot be undone. (y/n): ');
		
		if (!confirmed) {
			throw new Error('Clear operation cancelled.');
		}

		this.saveTasks([]);
	}

	private validateDateFormat(dateString: string): void {
		const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
		const match = dateString.match(dateRegex);
		
		if (!match) {
			throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD format (e.g., 2024-06-15)`);
		}

		const [, year, month, day] = match;
		
		// Validate date is actually valid
		const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
		if (date.getFullYear() !== parseInt(year) || 
			date.getMonth() !== parseInt(month) - 1 || 
			date.getDate() !== parseInt(day)) {
			throw new Error(`Invalid date: ${dateString}. Please provide a valid date.`);
		}
	}

	public setFileDate(dateString: string): void {
		if (!dateString) {
			throw new Error('Date is required for set-file-date command');
		}
		// Validate date format (YYYY-MM-DD)
		this.validateDateFormat(dateString);
		
		// Update the file path (using YYYY-MM-DD format directly)
		const directoryPath = path.dirname(this.tasksFilePath);
		const newFilePath = path.join(directoryPath, `${dateString}-tasks.json`);
		
		// Check if file exists - return error if not (DO NOT CREATE)
		if (!existsSync(newFilePath)) {
			throw new Error(`Tasks file for date ${dateString} does not exist. File: ${dateString}-tasks.json`);
		}
		
		// Only update file path and reload if file exists
		// Update file path
		this.tasksFilePath = newFilePath;
		// Save the current file path to state
		this.saveCurrentTasksFilePath(newFilePath);
		// Reload file content and tasks (file is guaranteed to exist at this point)
		this.fileContent = getFileContent(this.tasksFilePath);
		this.allTasks = this.getAllTasks();
	}

	public listFiles(): string {
		const directoryPath = path.dirname(this.tasksFilePath);
		
		if (!existsSync(directoryPath)) {
			return "No tasks directory found.";
		}

		try {
			const files = readdirSync(directoryPath);
			
			const taskFiles = files.filter(file => {
				const taskFileRegex = /^(\d{4})-(\d{2})-(\d{2})-tasks\.json$/;
				return taskFileRegex.test(file) && statSync(path.join(directoryPath, file)).isFile();
			});

			if (taskFiles.length === 0) {
				return "No task files found.";
			}

			taskFiles.sort();

			const fileList = taskFiles.map((file, index) => {
				const date = file.replace('-tasks.json', '');
				const filePath = path.join(directoryPath, file);
				const stats = statSync(filePath);
				const fileSize = stats.size;
				const modifiedDate = stats.mtime.toLocaleDateString('pt-BR', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit'
				});

				return `${index + 1}. ${date} (${fileSize} bytes, modified: ${modifiedDate})`;
			}).join('\n');

			return `Available task files:\n${fileList}`;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error reading tasks directory: ${error.message}`);
			}
			throw new Error('Error reading tasks directory');
		}
	}

	public getCurrentFileDate(): string {
		const fileName = path.basename(this.tasksFilePath);
		// Extract date from filename (YYYY-MM-DD-tasks.json)
		const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})-tasks\.json$/);
		
		if (dateMatch) {
			return dateMatch[1]; // Returns YYYY-MM-DD
		}
		
		// Fallback: return the filename if pattern doesn't match
		return fileName;
	}

	public parseArguments(args: string[]): IParsedArgs {
		// Skip node executable and script path
		const commandArgs = args.slice(2);
		
		if (commandArgs.length === 0) {
			return { command: null };
		}

		const command = commandArgs[0] as Command;
		const validCommands: Command[] = ['set-file-date','add', 'update', 'delete', 'mark-in-progress', 'mark-done', 'list', 'list-files', 'current-file', 'clear'];
		
		if (!validCommands.includes(command)) {
			return { command: null };
		}

		const parsed: IParsedArgs = { command };

		switch (command) {
			case 'set-file-date':
				if (commandArgs.length < 2) {
					throw new Error('Missing required argument: date (YYYY-MM-DD)');
				}
				parsed.date = commandArgs[1];
				break;

			case 'add':
				if (commandArgs.length < 2) {
					throw new Error('Missing required argument: description');
				}
				parsed.description = commandArgs[1];
				break;

			case 'update':
				if (commandArgs.length < 3) {
					throw new Error('Missing required arguments: UUID and description');
				}
				parsed.uuid = commandArgs[1] as UUID;
				parsed.description = commandArgs[2];
				break;

			case 'delete':
			case 'mark-in-progress':
			case 'mark-done':
				if (commandArgs.length < 2) {
					throw new Error(`Missing required argument: UUID`);
				}
				parsed.uuid = commandArgs[1] as UUID;
				break;

			case 'list':
				if (commandArgs.length >= 2) {
					const statusArg = commandArgs[1];
					// Map command-line status to TaskStatus type
					if (statusArg === 'todo') {
						parsed.statusFilter = 'todo';
					} else if (statusArg === 'in-progress') {
						parsed.statusFilter = 'in_progress';
					} else if (statusArg === 'done') {
						parsed.statusFilter = 'done';
					} else {
						throw new Error(`Invalid status filter: ${statusArg}. Valid values: todo, in-progress, done`);
					}
				}
				break;

			case 'list-files':
				// No arguments needed
				break;

			case 'current-file':
				// No arguments needed
				break;

			default:
				break;
		}

		return parsed;
	}

	public showHelp(): string {
		return `Task Tracker CLI - Usage

Commands:
  add "description"                    Add a new task
  update <uuid> "description"          Update a task's description
  delete <uuid>                        Delete a task
  mark-in-progress <uuid>              Mark a task as in progress
  mark-done <uuid>                     Mark a task as done
  list [status]                        List all tasks (optionally filter by status)
  list-files                           List all available task files
  current-file                         Show the date of the current task file
  clear                                Clear all tasks
  set-file-date "YYYY-MM-DD"           Select a file by date

Arguments:
  <uuid>                               UUID of the task
  "description"                        Description of the task

Status values for list:
  todo                                 Show only todo tasks
  in-progress                          Show only in-progress tasks
  done                                 Show only done tasks

Examples:
  task add "Buy groceries"
  task update c2a01015-c3c2-4605-930b-cdcaf5ff16ca "Buy groceries and cook dinner"
  task delete c2a01015-c3c2-4605-930b-cdcaf5ff16ca
  task mark-in-progress c2a01015-c3c2-4605-930b-cdcaf5ff16ca
  task mark-done c2a01015-c3c2-4605-930b-cdcaf5ff16ca
  task list
  task list done
  task list in-progress
  task list todo
  task list-files
  task current-file
  task clear
  task set-file-date "2024-06-15"
`;
	}

	public async routeCommand(parsedArgs: IParsedArgs): Promise<string> {
		if (!parsedArgs.command) {
			return this.showHelp();
		}

		try {
			switch (parsedArgs.command) {
				case 'set-file-date':
					if (!parsedArgs.date) {
						throw new Error('Date is required for set-file-date command');
					}
					this.setFileDate(parsedArgs.date);
					return `Switched to tasks file for date: ${parsedArgs.date}`;
				case 'add':
					if (!parsedArgs.description) {
						throw new Error('Description is required for add command');
					}
					this.createNewTask(parsedArgs.description);
					const newTask = this.allTasks[this.allTasks.length - 1];
					return `Task added successfully (UUID: ${newTask.uuid})`;

				case 'update':
					if (!parsedArgs.uuid || !parsedArgs.description) {
						throw new Error('UUID and description are required for update command');
					}
					this.updateTask(parsedArgs.uuid, parsedArgs.description);
					return `Task updated successfully`;

				case 'delete':
					if (!parsedArgs.uuid) {
						throw new Error('UUID is required for delete command');
					}
					this.deleteTask(parsedArgs.uuid);
					return `Task deleted successfully`;

				case 'mark-in-progress':
					if (!parsedArgs.uuid) {
						throw new Error('UUID is required for mark-in-progress command');
					}
					this.updateTaskStatus(parsedArgs.uuid, 'in_progress');
					return `Task marked as in progress`;

				case 'mark-done':
					if (!parsedArgs.uuid) {
						throw new Error('UUID is required for mark-done command');
					}
					this.updateTaskStatus(parsedArgs.uuid, 'done');
					return `Task marked as done`;

				case 'list':
					if (parsedArgs.statusFilter) {
						return this.listTasksByStatus(parsedArgs.statusFilter);
					}
					return this.listAllTasks();

				case 'list-files':
					return this.listFiles();

				case 'current-file':
					return `Current task file: ${this.getCurrentFileDate()}`;
				
				case 'clear':
					await this.clearAllTasks();
					return `All tasks cleared successfully`;

				default:
					return this.showHelp();
			}
		} catch (error) {
			if (error instanceof Error) {
				return `Error: ${error.message}`;
			}
			return `Error: ${String(error)}`;
		}
	}
}