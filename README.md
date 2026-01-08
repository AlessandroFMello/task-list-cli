# Task Tracker CLI

A simple command-line interface (CLI) application to track and manage your tasks. Tasks are stored in JSON files organized by date, allowing you to manage tasks for different days.

## Features

- ✅ Add, update, and delete tasks
- ✅ Mark tasks as in-progress or done
- ✅ List all tasks or filter by status (todo, in-progress, done)
- ✅ Organize tasks by date (YYYY-MM-DD format)
- ✅ Switch between task files for different dates
- ✅ View current file and list all available files
- ✅ Interactive confirmation for destructive operations

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **File System**: Native Node.js `fs` module
- **No External Dependencies**: Uses only Node.js built-in modules

---

## Installation

### Prerequisites

- Node.js (v14 or higher)
- Yarn or npm

### Setup

1. Clone or download this repository
2. Install dependencies:

   ```bash
   yarn install
   # or
   npm install
   ```

3. Build the project:

   ```bash
   yarn build
   # or
   npm run build
   ```

4. Link the CLI command globally (optional):
   ```bash
   yarn link
   # or
   npm link
   ```

After linking, you can use the `task` command from any directory.

---

## Usage

### Basic Commands

#### Add a Task

```bash
task add "Buy groceries"
```

Output: `Task added successfully (UUID: <uuid>)`

#### List All Tasks

```bash
task list
```

#### List Tasks by Status

```bash
task list todo
task list in-progress
task list done
```

#### Update a Task

```bash
task update <uuid> "Updated description"
```

#### Delete a Task

```bash
task delete <uuid>
```

#### Mark Task as In Progress

```bash
task mark-in-progress <uuid>
```

#### Mark Task as Done

```bash
task mark-done <uuid>
```

#### Clear All Tasks

```bash
task clear
```

⚠️ This will prompt for confirmation before clearing all tasks.

---

## File Management Commands

### View Current File

```bash
task current-file
```

Shows the date of the currently selected task file.

### List All Task Files

```bash
task list-files
```

Lists all available task files with their dates, sizes, and modification dates.

### Switch to a Different Date File

```bash
task set-file-date "2024-06-15"
```

Switches to the task file for the specified date. The file must already exist.

### Get Help

```bash
task
# or
task help
```

Displays usage information and all available commands.

---

## Task Properties

Each task has the following properties:

- **uuid**: Unique identifier (UUID format)
- **description**: Task description
- **status**: Task status (`todo`, `in_progress`, or `done`)
- **createdAt**: ISO date string when the task was created
- **updatedAt**: ISO date string when the task was last updated

---

## File Structure

Tasks are stored in JSON files located in `src/tasks/` directory:

- Format: `YYYY-MM-DD-tasks.json` (e.g., `2024-06-15-tasks.json`)
- Each file contains an array of task objects
- Files are automatically created when you add the first task for a date
- The current file selection is persisted in `.current-task-file`

### Example Task File Structure

```json
[
  {
    "uuid": "c2a01015-c3c2-4605-930b-cdcaf5ff16ca",
    "description": "Buy groceries",
    "status": "todo",
    "createdAt": "2024-06-15T10:30:00.000Z",
    "updatedAt": "2024-06-15T10:30:00.000Z"
  }
]
```

---

## Examples

### Complete Workflow

```bash
# Add a new task
task add "Buy groceries"
# Output: Task added successfully (UUID: c2a01015-c3c2-4605-930b-cdcaf5ff16ca)

# List all tasks
task list

# Update the task
task update c2a01015-c3c2-4605-930b-cdcaf5ff16ca "Buy groceries and cook dinner"

# Mark as in progress
task mark-in-progress c2a01015-c3c2-4605-930b-cdcaf5ff16ca

# Mark as done
task mark-done c2a01015-c3c2-4605-930b-cdcaf5ff16ca

# List only done tasks
task list done

# Delete the task
task delete c2a01015-c3c2-4605-930b-cdcaf5ff16ca
```

### Working with Different Dates

```bash
# Check current file
task current-file
# Output: Current task file: 2024-06-15

# List all available files
task list-files
# Output:
# Available task files:
# 1. 2024-06-15 (500 bytes, modified: 06/15/2024)
# 2. 2024-06-16 (840 bytes, modified: 06/16/2024)

# Switch to a different date
task set-file-date "2024-06-16"

# Verify the switch
task current-file
# Output: Current task file: 2024-06-16

# Now all operations will use the 2024-06-16 file
task add "New task for June 16"
```

---

## Troubleshooting

### Command Not Found

If you get a "command not found" error:

1. Make sure you've built the project: `yarn build`
2. If you want to use it globally, run: `yarn link`
3. Alternatively, you can run it directly: `node dist/index.js <command>`

### File Not Found Error

If you get an error about a task file not existing:

- The `set-file-date` command requires the file to already exist
- Use `task list-files` to see available files
- Create a task for that date first using the default file (today's date)

### Permission Errors

If you encounter permission errors:

- Check file permissions in the `src/tasks/` directory
- Ensure you have read/write permissions
- On Linux/Mac, you may need to adjust directory permissions

### Invalid UUID Error

- Make sure you're using the full UUID (not just a number)
- UUIDs are displayed when you add a task or list tasks
- Copy the UUID exactly as shown

---

## Development

### Project Structure

```
task-tracker-cli/
├── src/
│   ├── cli.ts              # Main CLI class
│   ├── index.ts            # Entry point
│   ├── domain/
│   │   └── task.ts        # Task domain model
│   ├── helpers/            # Helper functions
│   ├── interfaces/         # TypeScript interfaces
│   └── types/              # Type definitions
├── dist/                   # Compiled JavaScript
├── src/tasks/              # Task JSON files
└── package.json
```

### Building

```bash
yarn build
```

### Running

```bash
# Development mode
yarn start

# Or use the compiled version
node dist/index.js <command>
```

---

## License

ISC

---

## Author

Created as part of backend roadmap studies.
