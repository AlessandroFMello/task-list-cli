import { createInterface } from "node:readline";
import { IConfirmationService } from "./IConfirmationService.js";

/**
 * Readline-based confirmation service
 */
export class ReadlineConfirmationService implements IConfirmationService {
  async ask(question: string): Promise<boolean> {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        const normalizedAnswer = answer.trim().toLowerCase();
        resolve(normalizedAnswer === "y" || normalizedAnswer === "yes");
      });
    });
  }
}


