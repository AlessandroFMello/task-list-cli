/**
 * Interface for user confirmation prompts
 */
export interface IConfirmationService {
  /**
   * Ask user for confirmation
   * @param question - Question to ask
   * @returns Promise resolving to true if confirmed, false otherwise
   */
  ask(question: string): Promise<boolean>;
}


