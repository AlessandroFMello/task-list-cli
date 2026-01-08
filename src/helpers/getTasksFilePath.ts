import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDate } from "./getDate.js";

/**
 * Get the project root directory (where the code is installed)
 * This is different from process.cwd() which returns the current working directory
 */
function getProjectRoot(): string {
    // Get the directory of the current file (dist/helpers/getTasksFilePath.js)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Navigate from dist/helpers/ to project root
    // dist/helpers/ -> dist/ -> project root
    return path.resolve(__dirname, '../..');
}

export const getTasksFilePath = (): string => {
    const date = getDate();
    const projectRoot = getProjectRoot();

    return path.join(projectRoot, `src/tasks/${date}-tasks.json`);
};

